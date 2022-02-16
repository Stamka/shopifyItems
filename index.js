require('dotenv').config();
const path = require('path')
const Shopify = require('shopify-api-node');
const fs = require('fs');

let directoryPath = path.join(__dirname,'/logs');
let logFilePath = path.join(directoryPath,'logfile')

let itemsCount=0;

const URL = 'smddev-dev-store.myshopify.com';
let accessToken = process.env.ACCESS_TOKEN;
if(!accessToken){
    console.log(`You should put your access token to .env file
    \rExample: ACCESS_TOKEN="Your Acces token here"`);
    process.exit(-1);
}


const shopify = new Shopify({
    shopName: 'smddev-dev-store',
    accessToken:accessToken,
});

checkFolderExist(directoryPath)

getAllProducts({limit:1});

function checkFolderExist(dir){
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
}
function writeData( data ){
    fs.appendFileSync(logFilePath,data,err=>{
        if (err){
            console.error(err);
            return;
        }
        console.log("Information about item was recorded in file :"+logFilePath);
    })

}

function* requestGenerator(params){
    // parameters for request  limit - maximum of items in request   
    do{
        params = yield fetchProduct(params);
    } while (true);
}

function fetchProduct(params){
    return new Promise((res,rej) => {
        let item = shopify.product.list(params);
        res(item);
    });
};

function getAllProducts(params,itemsCount = 0){
    let fetchGenerator =requestGenerator(params);
    let flagLastProduct = params;
    itemsCount++;
    // make requests untill the last page 
        let product = fetchGenerator.next(flagLastProduct);
        product.value.then(item => {
            params = item.nextPageParameters;
            writeData(JSON.stringify(item,null,4));
            if (params!== undefined){
                getAllProducts(params,itemsCount);
            }else{
                console.log(`Total items fetched and recorded to file: ${itemsCount}
                \rPath to file: ${logFilePath}`);
                return;
            }
        });
        return;
}

