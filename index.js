const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const bodyParser = require('body-parser');
const { Server } = require("socket.io");
const io = new Server(server);

const users = [
  { matricula: '632120019', senha: '1205', nome: 'gabi', saldo: 12.00 },
  { matricula: '123', senha: '123', nome: 'teste', saldo: 10.00 },
  // Adicione mais usuários conforme necessário
];

const menu = [
  { id: 1, nome: 'Hamburguer', preco: 10.99 },
  { id: 2, nome: 'Pizza', preco: 8.99 },
  { id: 3, nome: 'Salada', preco: 5.99 },
];
//Fila para armazenar pedidos
const filaDePedidos = [];

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/chat', (req, res) => {
  res.sendFile(__dirname + '/chat.html');
});

app.get('/kitchen', (req, res) => {
  res.sendFile(__dirname + '/kitchen.html');
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/login', (req, res) => {
  const { matricula, senha } = req.body;

  // Verificação de autenticação (simplificada para este exemplo)
  const user = users.find(user => user.matricula === matricula && user.senha === senha);

  if (user) {
    // Enviar o cardápio para o Terminal do Cliente
    res.redirect(`/chat?matricula=${matricula}`);
  } else {
    res.send('Matrícula ou senha incorretas.');
  }
});

io.on('connection', (socket) => {
  console.log('a usuario conectar');

  socket.emit('message', 'Qual é o seu nome?');

  socket.on('message', (msg) => {
    console.log('recebi uma mensagem', msg);
    const messageContent = msg.message;
    const userObject = users.find(user => user.matricula === user);

    // o usuario esta fazendo um pedido
    if (!isNaN(messageContent)) {
      // é o número do item do pedido
      // const menuItem = parseInt(messageContent, 10);
      // const menuItemData = menu.find(item => item.id === menuItem);
      // console.log('O usuário quer: ', menuItemData.nome);
      // if (menuItem && userObject) {
      //   // Verifique se o usuário tem saldo suficiente
      //   if (userObject.saldo >= menuItem.preco) {
      //     // o valor da compra do saldo do usuário
      //     console.log("O saldo do usuario era " + userObject.saldo + " e agora será " + (userObject.saldo - menuItem.preco));
      //     userObject.saldo -= menuItem.preco;
    
      //     // Adicione o pedido à fila para processamento
      //     filaDePedidos.push({
      //       user: userObject.nome,
      //       item: menuItem.nome,
      //     });
      //     socket.emit(
      //       'kitchen',
      //       filaDePedidos
      //     )
      //   }
      // }
    } else {
      // o usuário mandou uma mensagem de texto
      // socket.emit(
      //   'message',
      //   "O usuario nao tem saldo o suficiente"
      // )
    }
  });
  //   const menuItem = menu.find(item => item.id === menuItem);
  
  socket.on('command', (obj) => {
    const userObject = users.find(user => user.matricula === obj.user);

    console.log('recebi um comando', obj);
    switch (obj.command) {
      case 'addItem':
        // é o número do item do pedido
        console.log(menu, obj.menuItem)
        const menuItem = parseInt(obj.menuItem, 10);
        const menuItemData = menu.find(item => item.id === menuItem);
        console.log(`O usuário ${obj.user} quer: ${menuItemData.nome}`);
        if (menuItem && userObject) {
          console.log("O saldo do usuario era " + userObject.saldo + " e agora será " + (userObject.saldo - menuItemData.preco));

          // Verifique se o usuário tem saldo suficiente
          if (userObject.saldo >= menuItemData.preco) {
            // o valor da compra do saldo do usuário
            userObject.saldo -= menuItemData.preco;
      
            // Adicione o pedido à fila para processamento
            filaDePedidos.push({
              user: userObject.nome,
              item: menuItemData.nome,
            });
            socket.emit(
              'kitchen',
              filaDePedidos
            );
            
            socket.emit(
              'message',
              `Pedido adicionado`
            );
          } else {
            socket.emit(
              'message',
              `Saldo insuficiente (o usuário tem o saldo ${userObject.saldo} e o preço do item é ${menuItemData.preco})`
            );
          }
        }
        break;
      case 'showMenu':
        socket.emit(
          'commandData',
          {
            origin: obj,
            result: menu
          }
        )
        break;
      case 'wantRequest':
        socket.emit(
          'message',
          'Digite o número do ítem no cardápio'
        )
        break;
      // case 'doRequest':
      //   console.log('O usuário FEZ o pedido. Pediu pelo item com id: ', obj.value);
      //   socket.emit(
      //     'message',
      //     'Item adicionado ao pedido'
      //   )
      //   break;
      case 'saldoVerificado':
        // Notifique o cliente sobre a compra bem-sucedida
      try {
        console.log(users, obj);
        const saldo = users.find(user => user.matricula === obj.value).saldo;
        
        socket.emit('message',
          `Meu saldo é: ${saldo}`,);
      } catch (error) {
        socket.emit('message','Compra não realizada');

      } 
        break;
      default:
        console.log('Vou dizer que não entendi');
        socket.emit('message', 'Não entendi sua mensagem');
        break;
    }
  });
  socket.on('kitchen', (filaDePedidos) => {
    const pedidoList = document.getElementById('pedido-list');
    pedidoList.innerHTML = '';

    filaDePedidos.forEach(pedido => {
        const listItem = document.createElement('li');
        listItem.textContent = `${pedido.user}: ${pedido.item}`;
        pedidoList.appendChild(listItem);
    });
  });
});

server.listen(3000, () => {
  console.log('listening http://localhost:3000');
});

