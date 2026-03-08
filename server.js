const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn("yt-dlp", args);
    let out = "";
    let err = "";

    proc.stdout.on("data", d => out += d.toString());
    proc.stderr.on("data", d => err += d.toString());

    proc.on("close", code => {
      if (code === 0) resolve(out.trim());
      else reject(err);
    });
  });
}

app.get("/", (req,res)=>{
  res.json({
    status: true,
    message: "API working",
    endpoints: ["/ytmp4?url=", "/ytmp3?url=", "/ytinfo?url="]
  });
});

app.get("/ytmp4", async (req,res)=>{
  const { url } = req.query;
  if(!url) return res.status(400).json({status:false,error:"Missing url"});

  try{
    const link = await runYtDlp(["-f","best","-g",url]);
    res.json({status:true,download:link});
  }catch(e){
    res.status(500).json({status:false,error:String(e)});
  }
});

app.get("/ytmp3", async (req,res)=>{
  const { url } = req.query;
  if(!url) return res.status(400).json({status:false,error:"Missing url"});

  try{
    const link = await runYtDlp(["-f","bestaudio","-g",url]);
    res.json({status:true,download:link});
  }catch(e){
    res.status(500).json({status:false,error:String(e)});
  }
});

app.get("/ytinfo", async (req,res)=>{
  const { url } = req.query;
  if(!url) return res.status(400).json({status:false,error:"Missing url"});

  try{
    const info = await runYtDlp(["-J",url]);
    res.json(JSON.parse(info));
  }catch(e){
    res.status(500).json({status:false,error:String(e)});
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
  console.log("Server running on port " + PORT);
});