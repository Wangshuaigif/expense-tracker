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
  expenseHtml+=`<style>
  small{display:block;color:#909399;font-size:13px;line-height:2;}
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
    expenseHtml+='<small>'+cat+':'+byCategory[cat].toFixed(2)+'</small>';
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