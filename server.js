const express=require('express');const http=require('http');const path=require('path');const Database=require('better-sqlite3');const {Server}=require('socket.io');
const app=express(),server=http.createServer(app),io=new Server(server),PORT=process.env.PORT||3000;const db=new Database('database.db');
db.exec(`CREATE TABLE IF NOT EXISTS messages(id INTEGER PRIMARY KEY AUTOINCREMENT,username TEXT NOT NULL,text TEXT NOT NULL,created_at TEXT NOT NULL)`);
app.use(express.static(path.join(__dirname,'public')));
app.get('/api/messages',(req,res)=>res.json(db.prepare('SELECT id,username,text,created_at AS createdAt FROM messages ORDER BY id ASC LIMIT 200').all()));
const users=new Map();
io.on('connection',s=>{s.on('join',u=>{u=String(u||'').trim().slice(0,30);if(!u)return;s.data.username=u;users.set(s.id,u);io.emit('users',[...new Set(users.values())]);});s.on('sendMessage',t=>{const u=s.data.username,t2=String(t||'').trim().slice(0,2000);if(!u||!t2)return;const createdAt=new Date().toISOString();const r=db.prepare('INSERT INTO messages(username,text,created_at) VALUES(?,?,?)').run(u,t2,createdAt);io.emit('message',{id:Number(r.lastInsertRowid),username:u,text:t2,createdAt});});s.on('typing',v=>{if(s.data.username)s.broadcast.emit('typing',{username:s.data.username,isTyping:!!v});});s.on('disconnect',()=>{users.delete(s.id);io.emit('users',[...new Set(users.values())]);});});
server.listen(PORT,()=>console.log('Messenger running at http://localhost:'+PORT));
