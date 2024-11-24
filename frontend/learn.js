let body = document.querySelector('body')
let plusIcon = document.querySelector('.add-message img');
let sendButton = document.querySelector('.sending img');
let messageInput = document.querySelector('.message-bar');
let div1 = document.querySelector('.div1');
let div2 = document.querySelector('.div2');
let div3 = document.querySelector('.div3');
let modal = document.querySelector('.modal');
let modalUser = document.querySelector('.modal-user')
let modalContent = document.querySelector('.modal-content');
let modalContent2 = document.querySelector('.modal-content2');
let modalInput = document.querySelector('.modal-input')
let userField = document.querySelector('.user-field')
let chatBar = document.querySelector('.chat-bar');
let chatContent = document.querySelector('.chat-content');
let deleteButton = document.querySelector('.delete-button');
let blockButton = document.querySelector('.block-button');
let modalButton = document.querySelector('.modal-button');
let modalButton2 = document.querySelector('.modal-button2');
let modalButton3 = document.querySelector('.modal-button3');
let modalCancelButton = document.querySelector('.modal-cancel-button');
let modalCancelButton3 = document.querySelector('.modal-cancel-button3');
let messageBar = document.querySelector('.message-bar');
let newChatPageButton = document.querySelector('.new-chat-page button');
let conversations = document.querySelector('.conversations');
let singleConversation = document.querySelector('.single-conversation');
let newChatPage = document.querySelector('.new-chat-page');
let conversationTopBar = document.querySelector('.conversation-top-bar');
let mainChat = document.querySelector('.main-chat');
let sending = document.querySelector('.sending');
let rightMessage = document.querySelector('.right-message');
let leftMessage = document.querySelector('.left-message');
let currentConversation = null;
let sideSearchBar = document.querySelector('.search-message input');
let singleConversationList = [];
let socket;
let deleteChat = document.querySelector('.modal-delete-button');
let blockChat = document.querySelector('.modal-block-button');
let currentSender;
let urls = [];
let path;
let blockList = [];

function scrollBottom() {
    mainChat.scrollTop = mainChat.scrollHeight;
}

const removeBlur = () => {
    chatBar.style.filter = 'none';
    chatContent.style.filter = 'none';
    modal.style.display = 'none';
}

const addFriend = () => {
    chatBar.style.filter = 'blur(5px)';
    chatContent.style.filter = 'blur(5px)';
    modal.style.display = 'block';
    div1.style.display = 'flex';
    div2.style.display = 'none';
    div3.style.display = 'none';
}

plusIcon.addEventListener('click', addFriend);

modalButton.addEventListener('click', removeBlur);

modalButton2.addEventListener('click', removeBlur);

modalButton3.addEventListener('click', removeBlur);

deleteButton.addEventListener('click', () => {
    chatBar.style.filter = 'blur(5px)';
    chatContent.style.filter = 'blur(5px)';
    modal.style.display = 'block';
    div1.style.display = 'none'
    div2.style.display = 'flex'
    div3.style.display = 'none'
})

blockButton.addEventListener('click', () => {
    chatBar.style.filter = 'blur(5px)';
    chatContent.style.filter = 'blur(5px)';
    modal.style.display = 'block';
    div1.style.display = 'none'
    div2.style.display = 'none'
    div3.style.display = 'flex'
})

modalCancelButton.addEventListener('click', removeBlur);

modalCancelButton3.addEventListener('click', removeBlur);

// sendButton.addEventListener('click', () => {
//     if (messageInput.value)
//     {
//         console.log(messageInput.value);
//         messageInput.value = '';
//     }
// })

// messageBar.addEventListener('keydown', (event) => {
//     if (event.key == 'Enter' && messageInput.value)
//     {
//         console.log(messageInput.value);
//         messageInput.value = '';
//     }
// })

newChatPageButton.addEventListener('click', addFriend);

// input handling

sideSearchBar.addEventListener('input', (input) => {
    // console.log(input);
    const value = input.target.value.toLowerCase();
    // console.log(singleConversationList.single);
    let matchingUsers = [];
    singleConversationList.forEach(singleConversationList => {
        // console.log(singleConversationList.single);
        let matchingUser = singleConversationList.single.querySelector('.li1').textContent.toLowerCase().includes(value);
        if (matchingUser)
            matchingUsers.push(singleConversationList);
        })
    conversations.innerHTML = '';
    matchingUsers.forEach(user => {
        let newUser = conversations.appendChild(user.single.cloneNode(true));
        convClick(user.conv, newUser);
    })
})

modalInput.addEventListener('input', (input) => {
    const value = input.target.value.toLowerCase();
    let matchingUsers = [];
    const token = localStorage.getItem('authToken');
    fetch('http://localhost:8000/api/list-users/', {
        method: 'GET',
        headers: { 'Authorization': `Token ${token}`}
    })
        .then(response => response.json())
        .then(data => data.forEach(user => {
            // console.log(user)
            let newUser = modalUser.cloneNode(true);
            console.log(newUser)
            newUser.querySelector('.li1').textContent = user.username;
            newUser.style.display = 'flex';
            // userField.appendChild(newUser);
            if (value != '') {
                let matchingUser = newUser.querySelector('.li1').textContent.toLowerCase().includes(value);
                if (matchingUser)
                    matchingUsers.push(newUser);
            }
        }))
        .then(() => {
            userField.innerHTML = '';
            matchingUsers.forEach(user => {
                let newUser = userField.appendChild(user);
                convClick(user, newUser);
            })
            console.log('noo');
        })
        .catch(error => console.error('Error:', error));

})

function urlHandling() {

}

function listConversations() {
    const token = localStorage.getItem('authToken');
    fetch('http://localhost:8000/api/chat/', {
        method: 'GET',
        headers: { 'Authorization': `Token ${token}`}
    })
        .then(response => response.json())
        .then(data => data.conversations.forEach(conv => {
            let newSingleConversation = singleConversation.cloneNode(true);
            newSingleConversation.querySelector('.li1').textContent = conv.conversation;
            newSingleConversation.style.display = 'flex';
            let fullConv = {
                'single': newSingleConversation,
                'conv': conv,
            }
            singleConversationList.push(fullConv);
            conversations.appendChild(newSingleConversation);
            convClick(conv, newSingleConversation);
        }))
        .catch(error => console.error('Error:', error));
}

function convClick(conv, singleConv) {
    console.log(conv);
    console.log('----')
    console.log(singleConv);
    singleConv.addEventListener('click', () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.close(); // Close the current WebSocket
        }
        if (currentConversation)
            currentConversation.style.backgroundColor = '';
        currentConversation = singleConv;
        singleConv.style.backgroundColor = '#2E2E2E';
        newChatPage.style.display = 'none';
        conversationTopBar.style.display = 'flex';
        mainChat.style.display = 'flex';
        sending.style.display = 'flex';
        if (blockList.includes(conv.id))
            disableMessageBar();
        else
            enableMessageBar();
        listMessages(conv);
        realTime(conv, singleConv);
    })
}

function listMessages(conv) {
    const token = localStorage.getItem('authToken');
    fetch(`http://localhost:8000/api/chat/${conv.id}/`, {
        method: 'GET',
        headers: { 'Authorization': `Token ${token}`}
    })
        .then(response => response.json())
        .then(data => {
            conversationTopBar.querySelector('.top-bar-right .p1').textContent = data.display_name;
            mainChat.innerHTML = '';
            data.messages.forEach(message => {
                if (message.sender == conv.conversation)
                {
                    // console.log("left")
                    currentSender = message.sender_id;
                    let newLeftMessage = leftMessage.cloneNode(true);
                    newLeftMessage.querySelector('.left-message-p').textContent = message.content;
                    newLeftMessage.style.display = 'inline-block';
                    mainChat.appendChild(newLeftMessage);
                }
                else {
                    currentSender = message.sender_id;
                    let newRightMessage = rightMessage.cloneNode(true);
                    newRightMessage.querySelector('.right-message-p').textContent = message.content;
                    newRightMessage.style.display = 'inline-block';
                    mainChat.appendChild(newRightMessage);
                }
                scrollBottom();
            })
        })
}

function realTime(conv, singleConv) {
    console.log('ccvvvvv');
    // console.log(conv);
    // console.log('ssiiingl');
    // console.log(singleConv);
    // messageInput.addEventListener('click', () => {
    const token = localStorage.getItem('authToken');
    if (!socket || socket.readyState !== WebSocket.OPEN)
        socket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${conv.id}/?Token=${token}`);
    socket.onmessage = ({ data }) => {
        let receivedMessage = JSON.parse(data);
        // console.log('mmmmm');
        // console.log(receivedMessage);
        if (receivedMessage.type == 'send_message') {
            // console.log(receivedMessage);
            if (receivedMessage.message && receivedMessage.message.trim() != '')
            {
                // console.log(conv.conversation);
                // console.log(receivedMessage.user);
                if (conv.conversation == receivedMessage.user)
                {
                    // console.log(singleConv);
                    let newLeftMessage = leftMessage.cloneNode(true);
                    newLeftMessage.querySelector('.left-message-p').textContent = receivedMessage.message;
                    newLeftMessage.style.display = 'inline-block';
                    mainChat.appendChild(newLeftMessage);
                }
                else
                {
                    // console.log(singleConv);
                    let newRightMessage = rightMessage.cloneNode(true);
                    newRightMessage.querySelector('.right-message-p').textContent = receivedMessage.message;
                    newRightMessage.style.display = 'inline-block';
                    mainChat.appendChild(newRightMessage);
                }
                    
            }
            scrollBottom();
        }
        if (receivedMessage.type == 'delete_message') {
            let messages;
            if (conv.conversation == receivedMessage.user)
                messages = mainChat.querySelectorAll('.left-message');
            else
                messages = mainChat.querySelectorAll('.right-message');
            messages.forEach(message => {
                console.log(message)
                // console.log(conv.conversation)
                // if (currentSender == conv.conversation)
                // console.log('hna');
                // message.style.display = 'none';
                message.remove();
            })
            removeBlur();
        }
        else if (receivedMessage.type == 'block_user') {
            // console.log(singleConv)
            blockList.push(conv.id);
            disableMessageBar();
            removeBlur();
        }
        console.log('Message from server: ', receivedMessage.message);
    }
    socket.onopen = () => {
        sendButton.addEventListener('click', () => {
            if (messageInput.value)
            {
                if (messageInput.value.trim() != '') {
                    let jsonMessage = {'message': messageInput.value, 'user': singleConv.querySelector('.li1').textContent}
                    socket.send(JSON.stringify(jsonMessage));
                    // console.log(messageInput.value);
                }
                messageInput.value = '';
            }
        })
        
        messageBar.addEventListener('keydown', (event) => {
            if (event.key == 'Enter' && messageInput.value)
            {
                if (messageInput.value.trim() != '') {
                    console.log('dkhaall');
                    // console.log(messageInput.value.trim())
                    let jsonMessage = {'message': messageInput.value, 'user': singleConv.querySelector('.li1').textContent}
                    socket.send(JSON.stringify(jsonMessage));
                    // console.log(messageInput.value);
                }
                messageInput.value = '';
            }
        })

        deleteChat.addEventListener('click', () => {
            let action = { 'action': 'delete', 'sender_id': `${currentSender}` };
            console.log(currentSender);
            socket.send(JSON.stringify(action));
        })

        blockChat.addEventListener('click', () => {
            let action = { 'action': 'block' };
            socket.send(JSON.stringify(action));
        })
        // let data = { 'message': 'hello', 'user': 'kouferka' };
        // socket.send(JSON.stringify(data));
    }
}

function disableMessageBar() {
    messageBar.placeholder = 'You cannot send a message to this user';
    messageBar.style.textAlign = 'center';
    messageBar.value = '';
    messageBar.disabled = true;
    sendButton.disabled = true;
    sendButton.style.cursor = 'default';
}

function enableMessageBar() {
    messageBar.placeholder = 'Type a message...';
    messageBar.style.textAlign = 'left';
    messageBar.value = '';
    messageBar.disabled = false;
    sendButton.disabled = false;
    sendButton.style.cursor = 'pointer';
}

listConversations();