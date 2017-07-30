let Greeter = function(lang){
    this.lang = lang;
    this.greet = function(){

    switch (this.lang){
        case 'en': return 'you are from US/EN';
        case 'np': return 'you are from nepal';
        default : return 'lang did not match';
    }
    }
};

exports.hello = function(lang){
    return new Greeter(lang);
}
//module.exports = Greeter; // constructor pattern