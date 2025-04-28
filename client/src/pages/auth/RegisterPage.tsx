// import { Button, Flex } from 'antd';
// import { FieldValues, useForm } from 'react-hook-form';
// import { Link, useNavigate } from 'react-router-dom';
// import toastMessage from '../../lib/toastMessage';
// import { useRegisterMutation } from '../../redux/features/authApi';
// import { useAppDispatch } from '../../redux/hooks';
// import { loginUser } from '../../redux/services/authSlice';
// import decodeToken from '../../utils/decodeToken';
// import { toast } from 'sonner';

// const RegisterPage = () => {
//   const dispatch = useAppDispatch();
//   const navigate = useNavigate();
//   const [userRegistration] = useRegisterMutation();
//   const {
//     handleSubmit,
//     register,
//     formState: { errors },
//   } = useForm();

//   const onSubmit = async (data: FieldValues) => {
//     const toastId = toast.loading('Registering new account!');
//     try {
//       const res = await userRegistration(data).unwrap();

//       if (data.password !== data.confirmPassword) {
//         toastMessage({ icon: 'error', text: 'Password and confirm password must be same!' });
//         return;
//       }
//       if (res.statusCode === 201) {
//         const user = decodeToken(res.data.token);
//         dispatch(loginUser({ token: res.data.token, user }));
//         navigate('/');
//         toast.success(res.message, { id: toastId });
//       }
//     } catch (error: any) {
//       toastMessage({ icon: 'error', text: error.data.message });
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
//           Register
//         </h1>
//         <form onSubmit={handleSubmit(onSubmit)}>
//           <input
//             type='text'
//             {...register('name', { required: true })}
//             placeholder='Your Name*'
//             className={`input-field ${errors['name'] ? 'input-field-error' : ''}`}
//           />
//           <input
//             type='text'
//             {...register('email', { required: true })}
//             placeholder='Your Email*'
//             className={`input-field ${errors['email'] ? 'input-field-error' : ''}`}
//           />
//           <input
//             type='password'
//             placeholder='Your Password*'
//             {...register('password', { required: true })}
//             className={`input-field ${errors['password'] ? 'input-field-error' : ''}`}
//           />
//           <input
//             type='password'
//             placeholder='Confirm Password*'
//             {...register('confirmPassword', { required: true })}
//             className={`input-field ${errors['confirmPassword'] ? 'input-field-error' : ''}`}
//           />
//           <Flex justify='center'>
//             <Button
//               htmlType='submit'
//               type='primary'
//               style={{ textTransform: 'uppercase', fontWeight: 'bold' }}
//             >
//               Register
//             </Button>
//           </Flex>
//         </form>
//         <p style={{ marginTop: '1rem' }}>
//           Already have an account? <Link to='/login'>Login Here</Link>
//         </p>
//       </Flex>
//     </Flex>
//   );
// };

// export default RegisterPage;

import { Button, Flex } from 'antd';
import { FieldValues, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../../redux/features/authApi';
import { useAppDispatch } from '../../redux/hooks';
import { loginUser } from '../../redux/services/authSlice';
import decodeToken from '../../utils/decodeToken';
import { toast } from 'sonner';

const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [userRegistration] = useRegisterMutation();

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
  } = useForm();

  const onSubmit = async (data: FieldValues) => {
    const toastId = toast.loading('Registering new account...');
    if (data.password !== data.confirmPassword) {
      toast.error('Password and Confirm Password must match!', { id: toastId });
      return;
    }

    try {
      const res = await userRegistration(data).unwrap();
      if (res.statusCode === 201) {
        const user = decodeToken(res.data.token);
        dispatch(loginUser({ token: res.data.token, user }));
        navigate('/');
        toast.success('Registration Successful!', { id: toastId });
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Registration Failed', { id: toastId });
    }
  };

  return (
    <Flex justify="center" align="center" style={{ height: '100vh', backgroundColor: '#f4f6f9' }}>
      <Flex
        vertical
        style={{
          width: '420px',
          backgroundColor: '#ffffff',
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
          Register
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <input
            type="text"
            {...register('name', { required: true })}
            placeholder="Enter your name*"
            style={{
              padding: '0.8rem 1rem',
              borderRadius: '8px',
              border: errors.name ? '1px solid #f5222d' : '1px solid #d9d9d9',
              fontSize: '1rem',
              width: '100%',
            }}
          />
          <input
            type="text"
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
          <input
            type="password"
            {...register('confirmPassword', { required: true })}
            placeholder="Confirm your password*"
            style={{
              padding: '0.8rem 1rem',
              borderRadius: '8px',
              border: errors.confirmPassword ? '1px solid #f5222d' : '1px solid #d9d9d9',
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
              Register
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
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ color: '#164863', fontWeight: 'bold', textDecoration: 'underline' }}
          >
            Login Here
          </Link>
        </p>
      </Flex>
    </Flex>
  );
};

export default RegisterPage;
