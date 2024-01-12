const mongoose = require('mongoose');
const validator = require('validator'); 
const bcriptjs = require('bcryptjs'); 

const LoginSchema = new mongoose.Schema({
    email: {type: String, required:true },
    password: {type: String, required:true }
});

const LoginModel = mongoose.model('Login',LoginSchema); 

class Login {
    constructor(body){
        this.body = body; 
        this.errors = [];
        this.user = null;
    }

    async login(){
        this.valida();
        if(this.errors.length > 0) return; 
        this.user = await LoginModel.findOne({email: this.body.email}); 

        if(!this.user) { // usuario existe?
            this.errors.push('O usuário não existe!');
            return;
        }

        if(!bcriptjs.compareSync(this.body.password, this.user.password)){ // comparando a senha colocada no body com a senha do banco de dados
            this.errors.push('senha inválida!');
            this.user = null;
            return;
        }


    }

    async register(){ 
        
        this.valida();
        if(this.errors.length > 0) return; 

        await this.userExists(); 
        if(this.errors.length > 0) return; 

        const salt = bcriptjs.genSaltSync(); 
        this.body.password = bcriptjs.hashSync(this.body.password, salt);

        this.user = await LoginModel.create(this.body); 

    }

    async userExists(){ 
        this.user = await LoginModel.findOne({email: this.body.email}); 
        if(this.user) this.errors.push('Usuário já existe!');
    }

    valida(){
        this.cleanUp(); 
        
        // validação
        // email valido
        if(!validator.isEmail(this.body.email)) this.errors.push('E-mail inválido!'); // gerando erro no array de erros

        // senha entre 3 e 50 caracteres 
        if(this.body.password.length < 3 || this.body.password.length > 50) {// gerando erro no array de erros
            this.errors.push('A senha precisa ter entre 3 a 50 caracteres!');
        }

    }

    cleanUp(){
        for(const key in this.body){
            if(typeof this.body[key] !== 'string'){ // validação somente string
                this.body[key] = '';
            }
        }

        this.body = { // garantindo que somente esses campos sejam salvos(evitando o csrf)
            email: this.body.email,
            password: this.body.password
        };

    }
}

module.exports = Login;