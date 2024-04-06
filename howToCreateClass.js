class demoFunc {
    constructor(param1, param2) {
        this.para1 = param1;
        this.para2 = param2;
    }

    show1 = () => {
        console.log(this.para1);
    }

    show2 = () => {
        console.log(this.para2);
    }
}

class demoFuncExtend extends demoFunc {
    constructor(param1, param2, param3) {
        super(param1, param2);
        this.para3 = param3;
    }

    show3 = () => {
        console.log(this.para3);
    }
}


const demo1 = new demoFunc("dun", "xu");

demo1.show1();
demo1.show2();
demo1.show2();
