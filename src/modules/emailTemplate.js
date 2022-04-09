
function emailTemplate(name, email){
    let template = `<h2>Olá ${name}</h2><br/>
        <p>Clique no link a seguir para cadastrar uma nova senha:</p><br>
        <a href="/novasenha.html?evalue=${Buffer.from(email, 'utf8').toString('hex')}">NOVA SENHA</a>        
    `

    return template;

}

module.exports = emailTemplate;


// let b = Buffer.Buffer.from("heloworld", 'utf8').toString('hex')

// let c = Buffer.Buffer.from(b, 'hex').toString('utf8');
// console.log(b, c)