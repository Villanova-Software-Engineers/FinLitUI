import react, { useState } from 'react';

const LoginScreen = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirnmPassword, setConfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSignup, setIsSignup] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [school, setSchool] = useState('');
    
    const schools = [
        'School A',
        'School B',
        'School C',
        'School D',
        'School E'
    ]


    // const handleLogin = () => {
    //     onLogin(email, password);
    // };

    // const handlePasswordChange = (e) => {
    //     const value = e.target.value;
    //     setPassword(value);
    // }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isSignUp) {
                if (password !== confirmPassword) {
                    alert("Passwords do not match");
                    setIsLoading(false);
                    return;
                }

                // if (!Object.values(passwordChecks).every(Boolean)) {
                //     alert("Password does not meet all criteria");
                //     setIsLoading(false);
                //     return;
                // }

                if (!firstName.trim() || !lastName.trim() || !username.trim() || !school) {
                    alert("Please fill in all profile fields");
                    setIsLoading(false);
                    return;
                }

                const profileData = {
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    username: username.trim(),
                    school: school,
                    email: email
                };

                await signup(email, password, profileData);
            } else {
                await login(email, password);
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={styles.container}>
        <h2>Login</h2>
        <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
        />
        <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
        />
        <button onClick={handleLogin} style={styles.button}>
            Login
        </button>
        </div>
    );
}