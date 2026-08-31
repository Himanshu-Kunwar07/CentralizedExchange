import express from "express";
import { PrismaClient, Type,  Side } from "./generated/prisma/client";
import jwt from "jsonwebtoken";
import { authmiddleware } from "./middleware";
import { PrismaNeon } from "@prisma/adapter-neon";
import assert from "node:assert";

const app = express();
app.use(express.json());

const BALANCE = {
  user1: {
    id: 1,
    balance: {
      usd: 2000,
    }
  }
};

const ORDERBOOK = {
  "SOL": { price: 100},
  "BTC": { price: 10000},
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
    const token = jwt.sign({user: {id: user.id, email: user.email}}, "secret!@#");
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


app.post("/order", authmiddleware, async (req, res)=> {
  const userId = req.userId;
  const {asset, quantity, side, type  } = req.body;
  const price = ORDERBOOK[asset].price;


  


})



app.get("/orders", authmiddleware, async (req, res) => {
    const userId = req.userId;
    
    try{

      const orders = await prisma.orders.findMany({
        where: {userId: userId}
      });


      return res.status(200).json({
        orders
      })
      
    }catch(err){ 
      return res.status(501).json({
        msg: "Error is fecting the order",
        err
      })
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

// app.delete("/order/orderid");

// app.get("/depth");
 
// app.get("balance/usd");

// app.get("/");

app.listen(3000, ()=> {
    console.log("the server is running in port 3000")
} );
