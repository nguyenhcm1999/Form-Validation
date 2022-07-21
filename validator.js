
// Đối tượng `Validator`

function Validator(options){

    function getParent(element, selector) {
        while (element.parentElement) {
            // nếu thẻ cha của element khớp với selector thì dừng
            if (element.parentElement.matches(selector)){
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    var selectorRules = {};

    // Hàm thực hiện validate
    function validate(inputElement,rule){
        // value: inputElement.value
        // test func: rule.test

        // hàm errorElement dùng để lấy ra đúng form message từ cái inputElement
        var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector) 
        // console.log(errorElement)
        // console.log(getParent(inputElement,options.formGroupSelector))
        // hàm errorMessage dùng để kiểm tra nội dung nhập vào
        // var errorMessage = rule.test(inputElement.value) 
        var errorMessage;
        // Lấy ra các rules của selector
        var rules = selectorRules[rule.selector];
        // console.log(selectorRules)
        
        // Lặp qua từng rule & kiểm tra
        for (var i = 0; i < rules.length; ++ i) {
            
            switch(inputElement.type){
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    )
                    break;
                default:
                    errorMessage = rules[i](inputElement.value)
            }
            // rules[i] là rule.test()
            if (errorMessage) break;
        }

        // Nếu như có lỗi sẽ hiển thị 
        if (errorMessage){
            errorElement.innerText = errorMessage;
            getParent(inputElement,options.formGroupSelector).classList.add('invalid') 
        } else {
            errorElement.innerText = ''
            getParent(inputElement,options.formGroupSelector).classList.remove('invalid')
            }

        // covert errorMessage thành boolen
        // console.log(!errorMessage)
        return !errorMessage;
    }
    // Lấy ra element chứa form1
    var formElement = document.querySelector(options.form)
    // console.log(formElement) 
    // console.log(options)


    // Lấy element của form cần validate
    // nếu đúng form thì liệt kê ra từng rule 
    if (formElement) {
        // Khi submit form
        formElement.onsubmit = function (e) {
            e.preventDefault();

            var isFormValid = true;

            // Lặp qua từng rules và validate
            options.rules.forEach(function (rule){
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement,rule)
                // console.log(isValid)
                if (!isValid){
                    isFormValid = false;
                }
            });
            
            if (isFormValid) {
                // Trường hợp submit với javscript
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]')
                    // console.log(Array.from(enableInputs))
                    // Array.from() convert thành 1 array, trả về các thẻ input chứa thuộc tính name
                    var formValues = Array.from(enableInputs).reduce(function(values,input){
                        switch(input.type) {
                            case'radio':
                            // checked là pseudo class
                                values[input.name] = formElement.querySelector('input[name="' + input.name +  '"]:checked').value   
                                break;                              
                            case'checkbox':
                                if(!input.matches(':checked') && !values[input.name]){
                                    values[input.name] = ''
                                }
                                if(!input.matches(':checked')){
                                    return values;
                                } 
                                if(!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }
                                
                                values[input.name].push(input.value)

                                
                                break
                            case 'file':
                                values[input.name] = input.files;
                                break
                            default:
                                values[input.name] = input.value 
                        }   
                        
                        console.log(values)
                        return values
                    },{})    

                    options.onSubmit(formValues)
                }
                // Trường hợp submit với hành vi mặc định
                else {
                    formElement.submit()
                }
            }
        }



        // Lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input, ...)
        options.rules.forEach(function (rule){

        // Lưu lại các rules cho mỗi input      

        if (Array.isArray(selectorRules[rule.selector])) {
            selectorRules[rule.selector].push(rule.test)
        } else {
        // Trong lần chạy đầu tiên, array không phải là mảng thì mình gán cho nó
        // bằng một mảng có phần tử đầu tiên là rule đầu tiên
            selectorRules[rule.selector] = [rule.test];
        }
        console.log(selectorRules)

        // Dùng formElement thay cho document vì nếu 3 form đều có # fullname
        // hay #email thì bài toán sẽ lỗi, nên lấy trong form
        // Từ element chứa form1 liệt kê ra từng thẻ input có chứa rule.selector
            var inputElements = formElement.querySelectorAll(rule.selector)
            // console.log(inputElements)
            //trả về Nodelist tính chất gần giống array nhưng không có phương thức foreach map reduce ...
            
            Array.from(inputElements).forEach(function(inputElement){
                // Xử lý trường hợp blur khỏi input
                inputElement.onblur = function(){
                    validate(inputElement,rule)
                    // console.log(rule.test(inputElement.value))
                    // console.log(inputElement.value)
                    console.log(rule)
                }
                
                // Xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = function (){
                    var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector)
                    errorElement.innerText = ''
                    getParent(inputElement,options.formGroupSelector).classList.remove('invalid')
                }
            })
            // console.log(inputElement) 
            // console.log(rule)

        });
        // for(var i in selectorRules){console.log(selectorRules[i])}
        // console.log(selectorRules)
    }
}


// Định nghĩa rules
// Nguyên tắc của các rules:
// 1. Khi có lỗi => trả ra mess lỗi
// 2. Khi hợp lệ => không trả ra gì (undefined)
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            // .trim() loại bỏ tất cả dấu cách 2 bên đầu của chuỗi
            return value ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = function(selector,message) {
    return {
        selector: selector, 
        test: function (value) {
            var regax =/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ 
            return regax.test(value) ? undefined : message || 'Trường này phải là email'
        }
    }
}


Validator.minLength = function(selector,min, message) {
    return {
        selector: selector, 
        test: function (value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự`
        }
    }
}

Validator.isConfirmed = function (selector,getConfirmValue, message) {
    return {
        selector : selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || "Giá trị nhập vào không chính xác"
        }
    }
}