const auth = {
    username: '',
    password: '',
    prompt: function() {
        return new Promise(
            function(resolve, reject) {
                if (this.username !== '' || this.password !== '') {
                    resolve();
                } else {
                    const authPrompt = document.createElement('div');
                    authPrompt.className = 'auth-prompt';

                    const submit = function() {
                        document.body.removeChild(authPrompt);
                        this.username = usernameInput.value;
                        this.password = passwordInput.value;
                        resolve();
                    }.bind(this);

                    const label = document.createElement('label');
                    label.textContent = 'Please enter username and password:';
                    label.for = 'auth-prompt-username';
                    authPrompt.appendChild(label);

                    const usernameInput = document.createElement('input');
                    usernameInput.id = 'auth-prompt-username';
                    usernameInput.type = 'text';
                    authPrompt.appendChild(usernameInput);

                    const passwordInput = document.createElement('input');
                    passwordInput.id = 'auth-prompt-password';
                    passwordInput.type = 'password';
                    passwordInput.addEventListener(
                        'keyup',
                        function(e) {
                            if (e.keyCode == 13) submit();
                        },
                        false
                    );
                    authPrompt.appendChild(passwordInput);

                    var button = document.createElement('button');
                    button.textContent = 'Submit';
                    button.addEventListener('click', submit, false);
                    authPrompt.appendChild(button);

                    document.body.appendChild(authPrompt);
                }
            }.bind(this)
        );
    }
};
