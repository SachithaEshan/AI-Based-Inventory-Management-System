// import {Button, Col, Flex, Row} from 'antd';
// import {FieldValues, useForm} from 'react-hook-form';
// import CustomInput from '../components/CustomInput';
// import toastMessage from '../lib/toastMessage';
// import {useGetAllBrandsQuery} from '../redux/features/management/brandApi';
// import {useGetAllCategoriesQuery} from '../redux/features/management/categoryApi';
// import {useCreateNewProductMutation} from '../redux/features/management/productApi';
// import {useGetAllSellerQuery} from '../redux/features/management/sellerApi';
// import {ICategory} from '../types/product.types';
// import CreateSeller from '../components/product/CreateSeller';
// import CreateCategory from '../components/product/CreateCategory';
// import CreateBrand from '../components/product/CreateBrand';

// const CreateProduct = () => {
//   const [createNewProduct] = useCreateNewProductMutation();
//   const {data: categories} = useGetAllCategoriesQuery(undefined);
//   const {data: sellers} = useGetAllSellerQuery(undefined);
//   const {data: brands} = useGetAllBrandsQuery(undefined);

//   const {
//     handleSubmit,
//     register,
//     formState: {errors},
//     reset,
//   } = useForm();

//   const onSubmit = async (data: FieldValues) => {
//     const payload = {...data};
//     payload.price = Number(data.price);
//     payload.stock = Number(data.stock);
//     payload.reorder_threshold = Number(data.reorder_threshold);

//     if (payload.size === '') {
//       delete payload.size;
//     }

//     try {
//       const res = await createNewProduct(payload).unwrap();
//       if (res.statusCode === 201) {
//         toastMessage({icon: 'success', text: res.message});
//         reset();
//       }
//     } catch (error: any) {
//       console.error('Error creating product:', error);
      
//       // Handle different error structures
//       const errorMessage = error?.data?.message || error?.message || 'Failed to create product';
//       toastMessage({icon: 'error', text: errorMessage});
//     }
//   };

//   return (
//     <>
//       <Row
//         gutter={30}
//         style={{
//           height: 'calc(100vh - 6rem)',
//           overflow: 'auto',
//         }}
//       >
//         <Col
//           xs={{span: 24}}
//           lg={{span: 14}}
//           style={{
//             display: 'flex',
//           }}
//         >
//           <Flex
//             vertical
//             style={{
//               width: '100%',
//               padding: '1rem 2rem',
//               border: '1px solid #164863',
//               borderRadius: '.6rem',
//             }}
//           >
//             <h1
//               style={{
//                 marginBottom: '.8rem',
//                 fontWeight: '900',
//                 textAlign: 'center',
//                 textTransform: 'uppercase',
//               }}
//             >
//               Add New Product
//             </h1>
//             <form onSubmit={handleSubmit(onSubmit)}>
//               <CustomInput
//                 name='name'
//                 errors={errors}
//                 label='Name'
//                 register={register}
//                 required={true}
//               />
//               <CustomInput
//                 errors={errors}
//                 label='Price'
//                 type='number'
//                 name='price'
//                 register={register}
//                 required={true}
//               />
//               <CustomInput
//                 errors={errors}
//                 label='Stock'
//                 type='number'
//                 name='stock'
//                 register={register}
//                 required={true}
//               />
//               <CustomInput
//                 errors={errors}
//                 label='Reorder Threshold'
//                 type='number'
//                 name='reorder_threshold'
//                 register={register}
//                 required={true}
//                 tooltip="Minimum stock level before warning. When stock falls below this number, a warning will appear."
//               />
//               <Row>
//                 <Col xs={{span: 23}} lg={{span: 6}}>
//                   <label htmlFor='Size' className='label'>
//                     Seller
//                   </label>
//                 </Col>
//                 <Col xs={{span: 23}} lg={{span: 18}}>
//                   <select
//                     {...register('seller', {required: true})}
//                     className={`input-field ${errors['seller'] ? 'input-field-error' : ''}`}
//                   >
//                     <option value=''>Select Seller*</option>
//                     {sellers?.data.map((item: ICategory) => (
//                       <option value={item._id}>{item.name}</option>
//                     ))}
//                   </select>
//                 </Col>
//               </Row>

//               <Row>
//                 <Col xs={{span: 23}} lg={{span: 6}}>
//                   <label htmlFor='Size' className='label'>
//                     Category
//                   </label>
//                 </Col>
//                 <Col xs={{span: 23}} lg={{span: 18}}>
//                   <select
//                     {...register('category', {required: true})}
//                     className={`input-field ${errors['category'] ? 'input-field-error' : ''}`}
//                   >
//                     <option value=''>Select Category*</option>
//                     {categories?.data.map((item: ICategory) => (
//                       <option value={item._id}>{item.name}</option>
//                     ))}
//                   </select>
//                 </Col>
//               </Row>

//               <Row>
//                 <Col xs={{span: 23}} lg={{span: 6}}>
//                   <label htmlFor='Size' className='label'>
//                     Brand
//                   </label>
//                 </Col>
//                 <Col xs={{span: 23}} lg={{span: 18}}>
//                   <select
//                     {...register('brand')}
//                     className={`input-field ${errors['brand'] ? 'input-field-error' : ''}`}
//                   >
//                     <option value=''>Select brand</option>
//                     {brands?.data.map((item: ICategory) => (
//                       <option value={item._id}>{item.name}</option>
//                     ))}
//                   </select>
//                 </Col>
//               </Row>

//               <CustomInput label='Description' name='description' register={register} />

//               <Row>
//                 <Col xs={{span: 23}} lg={{span: 6}}>
//                   <label htmlFor='Size' className='label'>
//                     Size
//                   </label>
//                 </Col>
//                 <Col xs={{span: 23}} lg={{span: 18}}>
//                   <select className={`input-field`} {...register('size')}>
//                     <option value=''>Select Product Size</option>
//                     <option value='SMALL'>Small</option>
//                     <option value='MEDIUM'>Medium</option>
//                     <option value='LARGE'>Large</option>
//                   </select>
//                 </Col>
//               </Row>
//               <Flex justify='center'>
//                 <Button
//                   htmlType='submit'
//                   type='primary'
//                   style={{textTransform: 'uppercase', fontWeight: 'bold'}}
//                 >
//                   Add Product
//                 </Button>
//               </Flex>
//             </form>
//           </Flex>
//         </Col>
//         <Col xs={{span: 24}} lg={{span: 10}}>
//           <Flex
//             vertical
//             style={{
//               width: '100%',
//               height: '100%',
//               padding: '1rem 2rem',
//               border: '1px solid #164863',
//               borderRadius: '.6rem',
//               justifyContent: 'space-around',
//             }}
//           >
//             <CreateSeller />
//             <CreateCategory />
//             <CreateBrand />
//           </Flex>
//         </Col>
//       </Row>
//     </>
//   );
// };

// export default CreateProduct;

import { Button, Col, Flex, Row } from 'antd';
import { FieldValues, useForm } from 'react-hook-form';
import CustomInput from '../components/CustomInput';
import toastMessage from '../lib/toastMessage';
import { useGetAllBrandsQuery } from '../redux/features/management/brandApi';
import { useGetAllCategoriesQuery } from '../redux/features/management/categoryApi';
import { useCreateNewProductMutation } from '../redux/features/management/productApi';
import { useGetAllSellerQuery } from '../redux/features/management/sellerApi';
import { ICategory } from '../types/product.types';
import CreateSeller from '../components/product/CreateSeller';
import CreateCategory from '../components/product/CreateCategory';
import CreateBrand from '../components/product/CreateBrand';

const CreateProduct = () => {
  const [createNewProduct] = useCreateNewProductMutation();
  const { data: categories } = useGetAllCategoriesQuery(undefined);
  const { data: sellers } = useGetAllSellerQuery(undefined);
  const { data: brands } = useGetAllBrandsQuery(undefined);

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data: FieldValues) => {
    const payload = { ...data };
    payload.price = Number(data.price);
    payload.stock = Number(data.stock);
    payload.reorder_threshold = Number(data.reorder_threshold);

    if (payload.size === '') {
      delete payload.size;
    }

    try {
      const res = await createNewProduct(payload).unwrap();
      if (res.statusCode === 201) {
        toastMessage({ icon: 'success', text: res.message });
        reset();
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to create product';
      toastMessage({ icon: 'error', text: errorMessage });
    }
  };

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
      <Row gutter={[24, 24]}>
        {/* Product Form */}
        <Col xs={24} lg={14}>
          <div style={cardStyle}>
            <h1 style={formTitle}>🛒 Add New Product</h1>
            <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: '1.5rem' }}>
              {/* Basic Inputs */}
              <CustomInput name="name" errors={errors} label="Name" register={register} required />
              <CustomInput name="price" errors={errors} label="Price" register={register} type="number" required />
              <CustomInput name="stock" errors={errors} label="Stock" register={register} type="number" required />
              <CustomInput name="reorder_threshold" errors={errors} label="Reorder Threshold" register={register} type="number" required
                tooltip="Minimum stock level before warning. When stock falls below this number, a warning will appear."
              />

              {/* Seller Select */}
              <SelectField
                label="Seller"
                name="seller"
                register={register}
                errors={errors}
                options={sellers?.data}
                required
              />

              {/* Category Select */}
              <SelectField
                label="Category"
                name="category"
                register={register}
                errors={errors}
                options={categories?.data}
                required
              />

              {/* Brand Select */}
              <SelectField
                label="Brand"
                name="brand"
                register={register}
                errors={errors}
                options={brands?.data}
              />

              {/* Size Select */}
              <SelectField
                label="Size"
                name="size"
                register={register}
                errors={errors}
                options={[
                  { _id: 'SMALL', name: 'Small' },
                  { _id: 'MEDIUM', name: 'Medium' },
                  { _id: 'LARGE', name: 'Large' }
                ]}
                />

              {/* Description */}
              <CustomInput name="description" errors={errors} label="Description" register={register} />

              {/* Submit Button */}
              <Flex justify="center" style={{ marginTop: '2rem' }}>
                <Button
                  htmlType="submit"
                  type="primary"
                  style={{
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                    padding: '0.8rem 2rem',
                    backgroundColor: '#164863',
                    borderColor: '#164863',
                  }}
                >
                  Add Product
                </Button>
              </Flex>
            </form>
          </div>
        </Col>

        {/* Side Widgets (Create Seller, Category, Brand) */}
        <Col xs={24} lg={10}>
          <div style={cardStyle}>
            <h2 style={{ textAlign: 'center', color: '#164863', marginBottom: '1.5rem' }}>
              Quick Create Tools
            </h2>
            <Flex vertical gap="1.5rem">
              <CreateSeller />
              <CreateCategory />
              <CreateBrand />
            </Flex>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default CreateProduct;

// Inline Styles
const cardStyle = {
  backgroundColor: '#ffffff',
  padding: '2rem',
  borderRadius: '12px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  minHeight: '100%',
};

const formTitle = {
  textAlign: 'center' as const,
  fontWeight: 800,
  fontSize: '1.8rem',
  color: '#164863',
  textTransform: 'uppercase' as const,
};

const SelectField = ({ label, name, register, errors, options = [], required = false }: any) => (
  <Row style={{ marginBottom: '1.2rem', alignItems: 'center' }}>
    <Col xs={24} lg={6}>
      <label
        htmlFor={name}
        style={{
          fontWeight: 600,
          fontSize: '1rem',
          marginBottom: '.3rem',
          color: '#164863',
        }}
      >
        {label}
      </label>
    </Col>
    <Col xs={24} lg={18}>
      <select
        {...register(name, { required })}
        style={{
          width: '100%',
          padding: '0.6rem',
          borderRadius: '8px',
          border: errors[name] ? '1px solid #ff4d4f' : '1px solid #d9d9d9',
          backgroundColor: '#fff',
          fontSize: '1rem',
          marginTop: '0.3rem',
        }}
      >
        <option value="">{`Select ${label}${required ? '*' : ''}`}</option>
        {options.map((item: ICategory) => (
          <option key={item._id} value={item._id}>
            {item.name}
          </option>
        ))}
      </select>
    </Col>
  </Row>
);
