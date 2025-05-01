// import { Button, Flex } from 'antd';
// import { FieldValues, useForm } from 'react-hook-form';
// import { Link, useNavigate } from 'react-router-dom';
// import { toast } from 'sonner';
// import { useLoginMutation } from '../../redux/features/authApi';
// import { useAppDispatch } from '../../redux/hooks';
// import { loginUser } from '../../redux/services/authSlice';
// import decodeToken from '../../utils/decodeToken';

// const LoginPage = () => {
//   const [userLogin] = useLoginMutation();
//   const dispatch = useAppDispatch();
//   const navigate = useNavigate();
//   const {
//     handleSubmit,
//     register,
//     formState: { errors },
//   } = useForm();

//   const onSubmit = async (data: FieldValues) => {
//     const toastId = toast.loading('Logging...');
//     try {
//       const res = await userLogin(data).unwrap();

//       if (res.statusCode === 200) {
//         const user = decodeToken(res.data.token);
//         dispatch(loginUser({ token: res.data.token, user }));
//         navigate('/');
//         toast.success('Successfully Login!', { id: toastId });
//       }
//     } catch (error: any) {
//       toast.error(error.data.message, { id: toastId });
//     }
//   };

//   return (
//     <Flex justify='center' align='center' style={{ height: '100vh' }}>
//       <Flex
//         vertical
//         style={{
//           width: '400px',
//           padding: '3rem',
//           border: '1px solid #164863',
//           borderRadius: '.6rem',
//         }}
//       >
//         <h1 style={{ marginBottom: '.7rem', textAlign: 'center', textTransform: 'uppercase' }}>
//           Login
//         </h1>
//         <form onSubmit={handleSubmit(onSubmit)}>
//           <input
//             type='email'
//             {...register('email', { required: true })}
//             placeholder='Your Email*'
//             className={`input-field ${errors['email'] ? 'input-field-error' : ''}`}
//           />
//           <input
//             type='password'
//             placeholder='Your Password*'
//             className={`input-field ${errors['password'] ? 'input-field-error' : ''}`}
//             {...register('password', { required: true })}
//           />
//           <Flex justify='center'>
//             <Button
//               htmlType='submit'
//               type='primary'
//               style={{ textTransform: 'uppercase', fontWeight: 'bold' }}
//             >
//               Login
//             </Button>
//           </Flex>
//         </form>
//         <p style={{ marginTop: '1rem' }}>
//           Don't have any account? <Link to='/register'>Register Here</Link>
//         </p>
//       </Flex>
//     </Flex>
//   );
// };

// export default LoginPage;

//2nd way

import { Button, Flex } from 'antd';
import { FieldValues, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useLoginMutation } from '../../redux/features/authApi';
import { useAppDispatch } from '../../redux/hooks';
import { loginUser } from '../../redux/services/authSlice';
import decodeToken from '../../utils/decodeToken';

const LoginPage = () => {
  const [userLogin] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: FieldValues) => {
    const toastId = toast.loading('Logging in...');
    try {
      const res = await userLogin(data).unwrap();
      if (res.statusCode === 200) {
        const user = decodeToken(res.data.token);
        dispatch(loginUser({ token: res.data.token, user }));
        navigate('/');
        toast.success('Login successful!', { id: toastId });
      }
    } catch (error: any) {
      toast.error(error.data.message || 'Login failed', { id: toastId });
    }
  };

  return (
    <Flex justify="center" align="center" style={{ height: '100vh', backgroundColor: '#f4f6f9' }}>
      <Flex
        vertical
        style={{
          width: '400px',
          background: '#ffffff',
          padding: '3rem 2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <h1
          style={{
            marginBottom: '2rem',
            textAlign: 'center',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            color: '#164863',
            fontSize: '1.8rem',
          }}
        >
          Login
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <input
            type="email"
            {...register('email', { required: true })}
            placeholder="Enter your email*"
            style={{
              padding: '0.8rem 1rem',
              borderRadius: '8px',
              border: errors.email ? '1px solid #f5222d' : '1px solid #d9d9d9',
              fontSize: '1rem',
              width: '100%',
            }}
          />
          <input
            type="password"
            {...register('password', { required: true })}
            placeholder="Enter your password*"
            style={{
              padding: '0.8rem 1rem',
              borderRadius: '8px',
              border: errors.password ? '1px solid #f5222d' : '1px solid #d9d9d9',
              fontSize: '1rem',
              width: '100%',
            }}
          />
          <Flex justify="center" style={{ marginTop: '1rem' }}>
            <Button
              htmlType="submit"
              type="primary"
              style={{
                textTransform: 'uppercase',
                fontWeight: 'bold',
                width: '100%',
                padding: '0.7rem',
                backgroundColor: '#164863',
                borderColor: '#164863',
              }}
            >
              Login
            </Button>
          </Flex>
        </form>

        <p
          style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            fontSize: '0.95rem',
            color: '#555',
          }}
        >
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{ color: '#164863', fontWeight: 'bold', textDecoration: 'underline' }}
          >
            Register Here
          </Link>
        </p>
      </Flex>
    </Flex>
  );
};

export default LoginPage;



