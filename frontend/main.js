let selectedStar = null;
let selectedEmoji = null;


// Verifica se é a página de feedback
if (document.getElementById("sendBtn")) {


// Seleção de estrelas
document.querySelectorAll('#stars span').forEach(star => {
star.addEventListener('click', () => {
selectedStar = star.getAttribute('data-value');
document.querySelectorAll('#stars span').forEach(s => s.classList.remove('selected'));
star.classList.add('selected');
});
});


// Seleção de emojis
document.querySelectorAll('#emojis span').forEach(emoji => {
emoji.addEventListener('click', () => {
selectedEmoji = emoji.getAttribute('data-value');
document.querySelectorAll('#emojis span').forEach(e => e.classList.remove('selected'));
emoji.classList.add('selected');
});
});


// Enviar feedback
document.getElementById('sendBtn').addEventListener('click', async () => {
const comment = document.getElementById('comment').value;


const payload = {
estrelas: selectedStar,
emoji: selectedEmoji,
comentario: comment
};


try {
await fetch('http://localhost:3000/feedback', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(payload)
});


alert('Feedback enviado com sucesso!');
} catch (error) {
alert('Erro ao enviar feedback.');
}
});
}


// Verifica se é a página do admin
if (document.getElementById("feedbackTable")) {
// Exemplo de carregamento futuro (fake por enquanto)
console.log("Dashboard pronto para integração com o backend.");
}
