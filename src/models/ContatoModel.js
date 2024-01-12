const mongoose = require('mongoose');
const validator = require('validator'); 


const ContatoSchema = new mongoose.Schema({
    nome: {type: String, required:true },
    sobrenome: {type: String, required:false, default:'' },
    email: {type: String, required:false, default:'' },
    telefone: {type: String, required:false, default:'' },
    criadoEm: {type: Date, default: Date.now } 
});

const ContatoModel = mongoose.model('Contato',ContatoSchema);

function Contato(body) {
    this.body = body;
    this.errors = [];
    this.contato = null;
}

Contato.prototype.register = async function () {
    this.valida();

    if (this.errors.length > 0) return;
    this.contato = await ContatoModel.create(this.body);
}

Contato.prototype.valida = function(){
    this.cleanUp(); 
    
    // validação
    if(this.body.email && !validator.isEmail(this.body.email)) this.errors.push('E-mail inválido!');
    if(!this.body.nome) this.errors.push('Nome é obrigatório!');
    if(!this.body.email && !this.body.telefone) {
        this.errors.push('Pelo menos um contato precisa ser enviado: e-mail ou telefone.');
    }

}

Contato.prototype.cleanUp = function(){
    for(const key in this.body){
        if(typeof this.body[key] !== 'string'){ // validação somente string
            this.body[key] = '';
        }
    }

    this.body = { // garantindo que somente esses campos sejam salvos(evitando o csrf)
        nome: this.body.nome,
        sobrenome: this.body.sobrenome,
        email: this.body.email,
        telefone: this.body.telefone
    };

}

Contato.prototype.edit = async function (id) {
    if(typeof id !== 'string') return;
    
    this.valida();
    if(this.errors.length > 0 ) return;

    this.contato = await ContatoModel.findByIdAndUpdate(id, this.body, {new: true}); // encontrar o contato por id e atualizar
}

// metodos estaticos 

Contato.buscaPorId = async function (id) { // não esta atrelado ao prototype para não precisar instanciar a classe Contato
    if(typeof id !== 'string') return;
    const contato = await ContatoModel.findById(id);
    return contato;
}

Contato.buscaContatos = async function () { 
    const contatos = await ContatoModel.find()
    .sort({ciadoEm: -1}); 
    return contatos;
}

Contato.delete = async function (id) { 
    if(typeof id !== 'string') return;
    const contato = await ContatoModel.findOneAndDelete({_id: id}); 
    return contato;
}

module.exports = Contato;