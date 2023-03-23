const express = require('express');
const cors = require('cors')
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express()
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ineyp7q.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{
        const categoryCollection = client.db('beautyBin').collection('category')
        const productCollection = client.db('beautyBin').collection('products')
        const orderCollection = client.db('beautyBin').collection('order')
        const userCollection = client.db('beautyBin').collection('user')
        // const sellerCollection = client.db('beautyBin').collection('seller')
        const paymentsCollection = client.db('beautyBin').collection('payment')
        const addProductCollection = client.db('beautyBin').collection('addProducts')



        // app.post('/create-payment-intent', async(req, res)=>{
        //     const order = req.body;
        //     const price = order.price;
        //     const amount = price*100;

        //     const paymentIntent = await stripe.paymentIntents.create({
               
        //         currency: "usd",
        //         amount: amount,
        //         "payment_method_types": [
        //             "card"
        //         ],
        //       });
        //       res.send({
        //         clientSecret: paymentIntent.client_secret,
        //       });
            
        // })

        // app.post('/create-payment-intent', async(req, res)=>{

        //     const order = req.body;
        //     const price = order.price;
        //     const amount = price*100;

        //     const paymentIntent = await stripe.paymentIntents.create({
        //         currency: 'usd',
        //         amount: amount,
        //         "payment_method_types" : [
        //             "card"
        //         ]
        //     });
        //     res.send({
        //         clientSecret: paymentIntent.client_secret,
        //     });

        // })

        app.post('/create-payment-intent', async (req, res) => {
            const order = req.body;
            const price = parseFloat(order.resale_price);
            
            const amount = Math.round(price * 100);
          
            const paymentIntent = await stripe.paymentIntents.create({
              currency: 'usd',
              amount,
              payment_method_types: ['card'],
            });

            res.send({
                 clientSecret: paymentIntent.client_secret,
            });
        });

        app.post('/payments', async (req, res)=>{
            const payment =req.body;
            const result = await paymentsCollection.insertOne(payment)
            res.send(result)

        });

        app.get('/category', async (req, res)=>{
            const query = {}
            const cursor = categoryCollection.find(query);
            const categories = await cursor.toArray();
            res.send(categories)
        })

       
        app.get('/products', async (req, res) => {
            
            let query = {};
            if(req.query.id){
             query={
                 id: req.query.id,
             };
            }
            const product = await productCollection.find(query).toArray()
            res.send(product);
         });
         

         app.post('/order', async(req, res) =>{
            const orders = req.body;
            console.log(orders);
            const result = await orderCollection.insertOne(orders);
            res.send(result);
        });

         app.get('/order', async(req, res) =>{
           let query = {}
           if(req.query.email){
            query = {
                email: req.query.email
            }
           }
           const cursor = orderCollection.find(query);
           const orders = await cursor.toArray();
           res.send(orders);
        });

         app.get('/order/:id', async(req, res) =>{
           const id = req.params.id;
           const query = {_id: new ObjectId(id)}
            const orders = await orderCollection.findOne(query)
           res.send(orders);
        });

         app.post('/addproduct', async(req, res) =>{
            const addProduct = req.body;
           
            const result = await addProductCollection.insertOne(addProduct);
            res.send(result);
        });
        app.get('/addproduct', async(req, res) =>{
           let query = {}
           if(req.query.email){
            query = {
                email: req.query.email
            }
           }
           const cursor = addProductCollection.find(query);
           const addProduct = await cursor.toArray();
           res.send(addProduct);
        });

        app.get('/buyer', async(req, res)=>{
            let query = {};
            if(req.query.Role){
                query = {
                    Role: req.query.Role
                }
            }
            const cursor = userCollection.find(query)
            const buyer = await cursor.toArray();
            res.send(buyer)
        })
        app.get('/seller', async(req, res)=>{
            let query = {};
            if(req.query.Role){
                query = {
                    Role: req.query.Role
                }
            }
            const cursor = userCollection.find(query)
            const buyer = await cursor.toArray();
            res.send(buyer)
        })


        


        app.post('/user', async(req, res) =>{
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
          
        });


        app.put('user/admin/:id', async(req, res)=>{
            const id = req.params.id
            const filter = {_id: ObjectId(id)}
            const options = {upsert : true}
            const updateDoc = {
                $set: {
                    Role: 'admin'
                } 
            }
            const result = await userCollection.updateOne(filter, updateDoc, options)
            req.send(result)
        })

        // app.post('/seller', async(req, res) =>{
        //     const seller = req.body;
        //     const result = await buyerCollection.insertOne(seller);
        //     res.send(result);
          
        // });

    }
    catch{

    }

}
run().catch(err =>console.log(err))


app.get('/',(req, res)=>{
    res.send("beauty sarver is running")
});

app.listen(port, ()=>{
    console.log(`server is running 0n ${port}`)
})