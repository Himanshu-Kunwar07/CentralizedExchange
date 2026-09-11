import express from "express";
import  type { Request, Response, NextFunction } from 'express';
import { PrismaClient, Type, Side } from "./generated/prisma/client";
import jwt from "jsonwebtoken";
import {  authmiddleware } from "./middleware";
import { PrismaNeon } from "@prisma/adapter-neon";
import assert from "node:assert";
import { crateClient } from 'redis';

const app = express();
app.use(express.json());


export interface customRequest  extends Request {
    userId? : number;
}

const BALANCE = 
  [
   { userId: 1,
    balance: {
      inr: {
        total: 40000, locked: 20000
      },
      AXIS: 20,
      HDFC: 30,
    }, }
  ];

enum type {
  BUY,
  successfully,
}

interface Orders {
  id: number;
  userId: number;
  price: number;
  type: Type;
  quantity: number;
  filledQantity: number;
  status: string;
  asset: string;
  side: Side;
  createAt: Date;
}

interface Orderbook {
  bids: Orders[];
  asks: Orders[];
}

let ORDERBOOK: Orderbook = {
  bids: [],
  asks: [],
};

const REALTIMEPRICE = {
  SOL: { price: 100 },
  BTC: { price: 10000 },
};

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

type SignupType = {
  username: string;
  email: string;
  password: string;
};

type SignInType = {
  username: string;
  email: string;
  password: string;
};

app.post("/signup", async (req, res) => {
  const { username, email, password }: SignupType = req.body;

  const userExist = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });

  if (userExist) {
    return res.status(409).json({
      msg: "user already exist please Log in",
    });
  } else {
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password,
      },
    });

    return res.status(201).json({
      msg: "User Created successfully",
    });
  }
});

app.post("/signin", async (req, res) => {
  const { username, email, password }: SignupType = req.body;

  const user = await prisma.user.findFirst({
    where: {
      email,
      password,
    },
  });

  if (!user) {
    return res.status(404).json({
      msg: "user not exist",
    });
  } else {
    const token = jwt.sign(
      { user: { id: user.id, email: user.email } },
      "secret!@#",
    );
    return res.status(200).json({
      token,
      userId: user.id,
    });
  }
});

/* 
    body  = {
        type:    "market" | "limit",
        price:    number | null,
        qty:     number
        market_id:    string,
        side:       "buy" | "sell"
    
    }


    @ return  { 
            orderid: number,
            filledqty: number,
            totalPrice: number, 
    }
*/

/*  Return the order status of the order ( partially filled, success, failed })
    also return the indiviual fills of the order */

app.post("/order", authmiddleware, async (req: customRequest, res: Response) => {
  const userId = req.userId;
  const { asset, quantity, side, type, price } = req.body;
 
    const totalCost = quantity * price;

    const userBalance =  BALANCE.find(b=> b.userId === userId);


    if(!userBalance) {
      return res.status(401).json({
        msg: "User balance is not found",
      })
    }

    const availableBalance = userBalance.balance.inr.total - userBalance.balance.inr.locked;


    if(!userBalance || availableBalance  < totalCost) {
      res.status(401).json({
        msg: "Insuffient Balance"
      })
    }

    
    try {
        
    const result = await prisma.$transaction( async(tx) => {
      const newOrder = prisma.orders.create({
        data: {
          asset,
          quantity,
          side,
          type,
          price,
          userId, 
        },
      });
      return newOrder;
    })

    userBalance.balance.inr.locked += totalCost;

    const orderForBook: Orders = {
      id: result.id,
      userId: result.userId,
      price: result.price,
      type: result.type,
      quantity: result.quantity,
      filledQantity: 0, 
      status: "PENDING", 
      asset: result.asset,
      side: result.side,
      createAt: new Date()
    };

    if(side === Side.BUY) {
      ORDERBOOK.bids.push(orderForBook);
      ORDERBOOK.bids.sort((a, b)=> b.price - a.price);
    }else {
      ORDERBOOK.asks.push(orderForBook);
      ORDERBOOK.asks.sort((a, b)=> b.price - a.price);
    };



    return res.status(200).json({
      msg: "Order placed successfully",
      order: result,
      availableBalance: userBalance.balance.inr.total - userBalance.balance.inr.locked
    });

    } catch (error) {
      return res.status(401).json({
        msg: "Error in putting the order in orderbook", 
        error: String(error),
      })
    } 
});

app.get("/orders", authmiddleware, async (req: customRequest, res: Response) => {
  const userId = req.userId;

  try {
    const orders = await prisma.orders.findMany({
      where: { userId: userId },
    });

    return res.status(200).json({
      orders,
    });
  } catch (err) {
    return res.status(501).json({
      msg: "Error is fecting the order",
      err,
    });
  }
});

// app.get("/order/orderid:", authmiddleware, async (req, res) => {
//   const { orderId } = req.params ;, //   const orderIdNum = parseInt(orderId, 10);

//   const order = await prisma.orders.findFirst({
//     where: { id: orderId },
//   });

//   res.status(200).json({
//     order,
//   });
// });


app.delete("/order/:orderid", authmiddleware, async(req: customRequest, res: Response)=> {
    const userId = req.userId;
    const orderId = parseInt(req.params.orderId);

    const order = await prisma.orders.findFirst({
      where: {id: orderId}
    })
    
    if(!order) {
      res.status(404).json({
        msg: "order not found"
      })
    };

    await prisma.orders.delete({
      where: {id: orderId}
    });

    const side = order?.side;

    if(side ===  Side.BUY) {
     ORDERBOOK.bids =  ORDERBOOK.bids.filter((e)=> e.id != orderId);
    }
    else {
     ORDERBOOK.asks =  ORDERBOOK.asks.filter((e)=> e.id != orderId); 
    }

    return res.status(200).json({
      msg: "order deleted successfully"
    });



});

app.get("/depth/:orderid", authmiddleware, (req: customRequest, res: Response)=> {
      
});

app.get("balance/", authmiddleware, (req: customRequest, res: Response)=> {
  const userId = req.userId;
  const userBalance = BALANCE.find(b=> b.userId === userId);
  
  if(!userBalance) {
    return res.status(404).json({
      msg: "user not found"
    })
  }

  return res.status(200).json({
    user: userBalance
  })
   
});

app.get("/");
app.listen(3000, () => {
  console.log("the server is running in port 3000");
});
