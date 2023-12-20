const userid = new URLSearchParams(location.search).get('matricula');
const socket = io();

let textarea = document.querySelector('#textarea');
let messageArea = document.querySelector('.message__area');

// textarea, detectando a tecla "Enter"
//  pressionada durante a digitação. Quando a tecla "Enter"
//   é pressionada, a função sendMessage()
//  é chamada com o valor atual do textarea como argumento.
textarea.addEventListener('keyup', (e) => {
  if(e.key === 'Enter') {

    socket.emit('command',
      {
        command: 'addItem',
        menuItem: e.target.value,
        user: userid
      }
    );
  }
});
// elemento de mensagem HTML, 
// define sua classe com base no 
// tipo (por exemplo, 'incoming' ou 'outgoing'),
//  atribui o conteúdo da mensagem a esse elemento
//   e o adiciona à área de mensagens no documento HTML.
function appendMessage(msg, type) {
  let mainDiv = document.createElement('div')
  let className = type
  mainDiv.classList.add(className, 'message')
  mainDiv.innerHTML = msg
  messageArea.appendChild(mainDiv)
};

// Essa função cria um objeto de mensagem 
// formatado, incluindo o nome do usuário 
// (variável "name") e o texto da 
// mensagem (após remover espaços em branco extras)
//  e o armazena na variável "msg".
function sendMessage(message) {
  let msg = {
      user: name,
      message: message.trim()
  }
  // Append 
  // adiciona uma mensagem (representada pelo objeto msg)
  //  à interface do usuário, marcando-a como "outgoing" 
  //  (de saída), limpa o valor do textarea e rola a 
  //  visualização para a parte inferior da interface.
  appendMessage(msg, 'outgoing')
  textarea.value = ''
  scrollToBottom()

  // Send to server 
  // envia uma mensagem (representada pelo objeto msg)
  //  para o servidor usando um socket (por meio da função emit), 
  //  presumivelmente para ser distribuída a outros clientes conectados ao mesmo servidor.
  socket.emit('message', msg)
};

// cria um elemento de mensagem (div) com conteúdo e classe específicos,
//  e o adiciona a uma área de mensagens no documento HTML.
function appendMessage(msg, type) {
  let mainDiv = document.createElement('div')
  let className = type
  mainDiv.classList.add(className, 'message')
  mainDiv.innerHTML = msg
  messageArea.appendChild(mainDiv)
};


// Quando o socket recebe uma mensagem ('message'), 
// o código imprime a mensagem no console, adiciona a mensagem à 
// interface do usuário chamando a função appendMessage com a classe 
// 'incoming', e rola para o final da área de mensagens usando a função scrollToBottom()
socket.on('message', (msg) => {
  console.log('RECEBI UMA MENSAGEM!', msg);
  appendMessage(msg, 'incoming')
  scrollToBottom()
});

// Este trecho de código utiliza Socket.IO
//  para ouvir eventos do tipo 'commandData'. 
//  Quando um evento é recebido, o código imprime no console a mensagem 
//  'RECEBI UM DADO DE UM COMANDO' juntamente com os dados recebidos. 
//  Em seguida, verifica o comando de origem no objeto commandData e, 
//  se for 'showMenu', gera uma string formatada contendo elementos
//   HTML com informações de um menu e a adiciona à
//    interface do usuário usando a função appendMessage.
socket.on('commandData', (commandData) => {
  console.log('RECEBI UM DADO DE UM COMANDO', commandData);
  switch (commandData.origin.command) {
      case 'showMenu':
          appendMessage(`<strong>Cardápio</strong><br/>
          ${
              commandData.result
                  .map(item => {
                      return `
                          <div class="menu-item">
                              <strong>
                                  ${item.id}
                                  ${item.nome}
                              </strong>
                              <span>
                                  R$${item.preco}
                              </span>
                          </div>
                      `;
                  })
                  .join('')
          }
          </ul>`, 'incoming')
          break;
  
      default:
          break;
  }
})


// Essa função, denominada askForTheMenu, 
// utiliza o Socket.IO para emitir um
//  evento chamado 'command'. O objeto
//   enviado como payload desse evento contém 
//   duas propriedades: 'command', 
//   com o valor 'showMenu', indicando que a 
//   solicitação é para exibir o menu, e 'value', 
//   que está vazio (''). Essa função é provavelmente 
//   utilizada para solicitar a exibição do menu por
//    meio do Socket.IO no lado do servidor.
function askForTheMenu () {
  socket.emit('command', {command: 'showMenu', value: ''});
}

function wantRequest () {
  socket.emit('command', {command: 'wantRequest', value: ''});
}

function scrollToBottom() {
messageArea.scrollTop = messageArea.scrollHeight
}

function saldoVerificado() {
  try {
     socket.emit('command', {command: 'saldoVerificado', value: userid});
  } catch (error) {
     socket.emit('command','não tem saldo suficiente');
  }
}