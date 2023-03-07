const express = require('express');
const cors = require('cors')
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()

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