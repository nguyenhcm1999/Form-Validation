
// Đối tượng `Validator`

function Validator(options){
    // Hàm thực hiện validate
    function validate(inputElement,rule){
        // value: inputElement.value
        // test func: rule.test
        var errorElement = inputElement.parentElement.querySelector('.form-message')
        var errorMessage = rule.test(inputElement.value)
        if (errorMessage){
            errorElement.innerText = errorMessage;
            inputElement.parentElement.classList.add('invalid')
        } else {
            errorElement.innerText = ''
            inputElement.parentElement.classList.remove('invalid')
            }
    }

    var formElement = document.querySelector(options.form)
    console.log(formElement) 
    console.log(options)


    // Lấy element của form cần validate
    // nếu đúng form thì liệt kê ra từng rule 
    if (formElement) {
        options.rules.forEach(function (rule){
        // Dùng formElement thay cho document vì nếu 3 form đều có # fullname
        // hay #email thì bài toán sẽ lỗi, nên lấy trong form
        // Liệt kê ra từng thẻ input có chứa rule.selector
            var inputElement = formElement.querySelector(rule.selector)
            console.log(inputElement) 
            

            if(inputElement) {
                // Xử lý trường hợp blur khỏi input
                inputElement.onblur = function(){
                    validate(inputElement,rule)
                }

                // Xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = function (){
                    var errorElement = inputElement.parentElement.querySelector(options.errorSelector)
                    errorElement.innerText = ''
                    inputElement.parentElement.classList.remove('invalid')
                }
            }
        })
    }
}


// Định nghĩa rules
// Nguyên tắc của các rules:
// 1. Khi có lỗi => trả ra mess lỗi
// 2. Khi hợp lệ => không trả ra gì (undefined)
Validator.isRequired = function (selector) {
    return {
        selector: selector,
        test: function (value) {
            // .trim() loại bỏ tất cả dấu cách 2 bên đầu của chuỗi
            return value.trim() ? undefined : 'Vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = function(selector) {
    return {
        selector: selector, 
        test: function (value) {
            var regax =/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ 
            return regax.test(value) ? undefined : 'Trường này phải là email'
        }
    }
}


Validator.minLength = function(selector,min) {
    return {
        selector: selector, 
        test: function (value) {
            return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`
        }
    }
}