const express = require("express");
const app = express();
const fs = require("fs").promises;
const DATA_FILE = "expenses.json";
async function readExpenses(){
  const data=await fs.readFile(DATA_FILE,"utf8");
  const expenses=JSON.parse(data);
  return expenses;
};
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/expenses", async (req, res) => {
  try {
    const expenses = await readExpenses();
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "读取账单失败" });
  }
});
app.get("/delete/:id",async(req,res)=>{
  let id=Number(req.params.id);
  let data=await fs.readFile("expenses.json","utf8");
  let expenses=JSON.parse(data);
  let rest=expenses.filter(e=>e.id!==id);
  await fs.writeFile("expenses.json",JSON.stringify(rest));
  res.redirect("/");
});
app.get("/",async(req,res)=>{
  let data=await fs.readFile("expenses.json","utf8");
  let expenses=JSON.parse(data);
  let expenseHtml="";
  expenseHtml+=`<meta name="viewport" content="width=device-width, initial-scale=1">`;
expenseHtml+=`<style>
body{font-family:system-ui,"Microsoft YaHei",sans-serif;background:#f4f5f7;color:#222;max-width:560px;margin:0 auto;padding:16px;line-height:1.6;}
h1{font-size:24px;margin:8px 0 16px;}
h2{font-size:20px;margin:0 0 6px;}
h3{font-size:18px;margin:20px 0 0;padding-top:14px;border-top:1px solid #e6e8eb;}
form{background:#fff;padding:16px;border-radius:14px;box-shadow:0 1px 4px rgba(0,0,0,.08);}
input,select{display:block;width:100%;box-sizing:border-box;font-size:16px;padding:10px 12px;margin:6px 0 16px;border:1px solid #dcdfe6;border-radius:10px;background:#fff;color:#222;}
button{display:block;width:100%;box-sizing:border-box;font-size:16px;font-weight:600;padding:12px;color:#fff;background:#2f7cf6;border:0;border-radius:10px;cursor:pointer;}
div{background:#fff;padding:14px 16px;border-radius:14px;box-shadow:0 1px 4px rgba(0,0,0,.08);margin-top:12px;}
small{display:block;font-size:13px;color:#909399;}
a{font-size:13px;color:#e34d59;text-decoration:none;}
.tag{display:inline-block;margin:10px 8px 0 0;padding:4px 12px;font-size:13px;color:#2f7cf6;background:#eaf2ff;border-radius:999px;}
  </style>`;
  expenseHtml+='<h1>记账软件</h1>';
  expenseHtml+='<form action="/expense" method="POST">';
  expenseHtml+='金额:<input type="number" name="amount" step="0.01" required>';
  expenseHtml+='分类:<select name="category">';
  expenseHtml+='<option value="餐饮">吃饭</option>';
  expenseHtml+='<option value="交通">交通</option>';
  expenseHtml+='<option value="购物">购物</option>';
  expenseHtml+='<option value="娱乐">娱乐</option>';
  expenseHtml+='<option value="其他">其他</option>';
  expenseHtml+='</select>';
  expenseHtml+='备注:<input type="text" name="note">';
  expenseHtml+='<button type="submit">记一笔</button>';
  expenseHtml+='</form>';
  let total=0;
  let byCategory={};
  for(let expense=0;expense<expenses.length;expense++){
    let amount=Number(expenses[expense].amount);
    total=total+amount;
    let cat=expenses[expense].category||'未分类';
    byCategory[cat]=(byCategory[cat]||0)+amount;
    expenseHtml+='<div>';
    expenseHtml+='<h2>金额:'+expenses[expense].amount+'</h2>';
    expenseHtml+='<small>分类:'+(expenses[expense].category||'未分类')+'</small>';
    expenseHtml+='<small>备注:'+(expenses[expense].note||'无')+'</small>';
    expenseHtml+='<small>时间:'+expenses[expense].time+'</small>';
    expenseHtml+=`<a href="/delete/${expenses[expense].id}" onclick="return confirm('确定删除吗？')">删除</a>`;
    expenseHtml+='</div>';
  }
  for(let cat in byCategory){
    expenseHtml+='<span class="tag">'+cat+':'+byCategory[cat].toFixed(2)+'</span>';
  }
  expenseHtml+='<h3>总支出:'+total.toFixed(2)+'</h3>';
  res.send(expenseHtml);
})
app.listen(3006, () => {
  console.log("记账软件已启动: http://localhost:3006");
});
app.post("/expense",async(req,res)=>{
  try{let amount=req.body.amount;
       let data=await fs.readFile("expenses.json","utf8")
       let expenses=JSON.parse(data);
       let newExpense={amount:Number(amount),
       id:Date.now(),
       time:new Date().toLocaleString(),
       category:req.body.category,
       note:req.body.note,
       };
       expenses.push(newExpense);
       await fs.writeFile("expenses.json",JSON.stringify(expenses));
       res.redirect("/");}catch(err){console.log(err);
        res.status(500).send("服务器错误");
       }
    });