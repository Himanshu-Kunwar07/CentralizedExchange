import express from 'express';




const app = express();


const BALANCE = {

}

const ORDERBOOK = {
    SOL: {},
    BTC: {}
}


app.post('/signup', (req, res)=> {});

app.post('/signin', (req, res)=> {});


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


app.post('/order', (req, res)=> {



});


/*  Return the order status of the order ( partially filled, success, failed })
    also return the indiviual fills of the order */


     

app.get('/order/orderid:');
app.delete('/order/orderid');

app.get('/depth');

app.get('/orders');

app.get('balance/usd');

app.get('/')



app.listen(3000);


