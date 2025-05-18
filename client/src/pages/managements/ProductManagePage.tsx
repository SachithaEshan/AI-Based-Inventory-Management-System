import { DeleteFilled, EditFilled } from '@ant-design/icons';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Col, Flex, Modal, Pagination, Row, Table, Tag, Tooltip } from 'antd';
import { useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import {
  useAddStockMutation,
  useDeleteProductMutation,
  useGetAllProductsQuery,
  useUpdateProductMutation,
} from '../../redux/features/management/productApi';
import { ICategory, IProduct } from '../../types/product.types';
import ProductManagementFilter from '../../components/query-filters/ProductManagementFilter';
import CustomInput from '../../components/CustomInput';
import toastMessage from '../../lib/toastMessage';
import { useGetAllCategoriesQuery } from '../../redux/features/management/categoryApi';
import { useGetAllSellerQuery } from '../../redux/features/management/sellerApi';
import { useGetAllBrandsQuery } from '../../redux/features/management/brandApi';
import { useCreateSaleMutation } from '../../redux/features/management/saleApi';
import { WarningOutlined } from '@ant-design/icons';
import LowStockWarning from '../../components/LowStockWarning';

const ProductManagePage = () => {
  const [query, setQuery] = useState({
    name: '',
    category: '',
    brand: '',
    limit: 10,
    page: 1,
    minPrice: 0,
    maxPrice: 20000,
  });

  const { data: products, isFetching } = useGetAllProductsQuery({
    ...query,
    minPrice: query.minPrice.toString(),
    maxPrice: query.maxPrice.toString()
  });

  const onChange: PaginationProps['onChange'] = (page) => {
    setQuery(prev => ({ ...prev, page }));
  };

  const handleFilterChange = (newQuery: Partial<typeof query>) => {
    setQuery(prev => ({ ...prev, ...newQuery, page: 1 }));
  };

  const tableData = products?.data?.map((product: IProduct) => ({
    key: product._id,
    name: product.name,
    category: product.category,
    categoryName: product.category.name,
    price: product.price,
    stock: product.stock,
    reorder_threshold: product.reorder_threshold,
    seller: product?.seller,
    sellerName: product?.seller?.name || 'DELETED SELLER',
    brand: product.brand,
    size: product.size,
    description: product.description,
  }));

  const columns: TableColumnsType<any> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          {record.stock < record.reorder_threshold && (
            <LowStockWarning stock={record.stock} reorderThreshold={record.reorder_threshold} />
          )}
        </div>
      ),
    },
    {
      title: 'Category',
      key: 'categoryName',
      dataIndex: 'categoryName',
      align: 'center',
    },
    {
      title: 'price',
      key: 'price',
      dataIndex: 'price',
      align: 'center',
    },
    {
      title: 'stock',
      key: 'stock',
      dataIndex: 'stock',
      align: 'center',
      render: (stock: number, record: any) => (
        <Flex align="center" justify="center" gap={8}>
          {stock}
          {stock < record.reorder_threshold && (
            <Tooltip title="Low stock warning">
              <WarningOutlined style={{ color: 'red' }} />
            </Tooltip>
          )}
        </Flex>
      ),
    },
    {
      title: 'Purchase From',
      key: 'sellerName',
      dataIndex: 'sellerName',
      align: 'center',
      render: (sellerName: string) => {
        if (sellerName === 'DELETED SELLER') return <Tag color='red'>{sellerName}</Tag>;
        return <Tag color='green'>{sellerName}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'x',
      align: 'center',
      render: (item) => {
        return (
          <div style={{ display: 'flex' }}>
            <SellProductModal product={item} />
            <AddStockModal product={item} />
            <UpdateProductModal product={item} />
            <DeleteProductModal id={item.key} />
          </div>
        );
      },
      width: '1%',
    },
  ];

  return (
    <>
      <ProductManagementFilter query={query} setQuery={handleFilterChange} />
      <Table
        size='small'
        loading={isFetching}
        columns={columns}
        dataSource={tableData}
        pagination={false}
      />
      <Flex justify='center' style={{ marginTop: '1rem' }}>
        <Pagination
          current={query.page}
          onChange={onChange}
          pageSize={query.limit}
          total={products?.meta?.total}
          showSizeChanger={false}
        />
      </Flex>
    </>
  );
};

/**
 * Sell Product Modal
 */
const SellProductModal = ({ product }: { product: IProduct & { key: string } }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm();
  const [saleProduct] = useCreateSaleMutation();

  const onSubmit = async (data: FieldValues) => {
    const payload = {
      product: product.key,
      productName: product.name,
      productPrice: product.price,
      quantity: Number(data.quantity),
      buyerName: data.buyerName,
      date: data.date,
    };
    try {
      const res = await saleProduct(payload).unwrap();
      if (res.statusCode === 201) {
        toastMessage({ icon: 'success', text: res.message });
        reset();
        handleCancel();
      }
    } catch (error: any) {
      console.log(error);
      handleCancel();
      toastMessage({ icon: 'error', text: error.data.message });
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        onClick={showModal}
        type='primary'
        className='table-btn'
        style={{ backgroundColor: 'royalblue', display: 'flex', gap: '8px', justifyContent: 'center'  }}
      >
        Sell
      </Button>
      <Modal 
  title={<div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>Sell Product</div>} 
  open={isModalOpen} 
  onCancel={handleCancel} 
  footer={null}
>
        <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: '2rem', padding: '0 1rem'  }}>
          <CustomInput
            name='buyerName'
            label='Buyer Name'
            errors={errors}
            required={true}
            register={register}
            type='text'
          />
          <CustomInput
            name='date'
            label='Selling date'
            errors={errors}
            required={true}
            register={register}
            type='date'
          />
          <CustomInput
            name='quantity'
            label='Quantity'
            errors={errors}
            required={true}
            register={register}
            type='number'
          />
          <Flex justify="center" style={{ marginTop: '1.5rem' }}>
      <Button htmlType="submit" type="primary" style={{ fontWeight: 600, padding: '0.7rem 1.5rem' }}>
        Sell Product
      </Button>
    </Flex>
        </form>
      </Modal>
    </>
  );
};

/**
 * Add Stock Modal
 */
const AddStockModal = ({ product }: { product: IProduct & { key: string } }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { handleSubmit, register, reset } = useForm();
  const [addToStock] = useAddStockMutation();

  const onSubmit = async (data: FieldValues) => {
    const payload = {
      stock: Number(data.stock),
      seller: product.seller,
    };

    try {
      const res = await addToStock({ id: product.key, payload }).unwrap();
      if (res.statusCode === 200) {
        toastMessage({ icon: 'success', text: res.message });
        reset();
        handleCancel();
      }
    } catch (error: any) {
      handleCancel();
      toastMessage({ icon: 'error', text: error.data.message });
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        onClick={showModal}
        type='primary'
        className='table-btn'
        style={{ backgroundColor: 'blue' , display: 'flex', gap: '8px', justifyContent: 'center' }}
      >
        Add Stock
      </Button>
      <Modal 
  title={<div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>Add Product to Stock</div>} 
  open={isModalOpen} 
  onCancel={handleCancel} 
  footer={null}
>
        <form onSubmit={handleSubmit(onSubmit)} style={{ margin: '2rem' }}>
          <CustomInput name='stock' label='Add Stock' register={register} type='number' />
          <Flex justify="center" style={{ marginTop: '1.5rem' }}>
      <Button htmlType="submit" type="primary" style={{ fontWeight: 600, padding: '0.7rem 1.5rem' }}>
        Submit
      </Button>
    </Flex>
        </form>
      </Modal>
    </>
  );
};

/**
 * Update Product Modal
 */
const UpdateProductModal = ({ product }: { product: IProduct & { key: string } }) => {
  const [updateProduct] = useUpdateProductMutation();
  const { data: categories } = useGetAllCategoriesQuery(undefined);
  const { data: sellers, isLoading: isSellerLoading } = useGetAllSellerQuery(undefined);
  const { data: brands } = useGetAllBrandsQuery(undefined);

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      name: product.name,
      price: product.price,
      seller: product?.seller?._id,
      category: product.category._id,
      brand: product.brand?._id,
      description: product.description,
      size: product.size,
      reorder_threshold: product.reorder_threshold,
    },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onSubmit = async (data: FieldValues) => {
    try {
      // Format the data before sending
      const formattedData: Record<string, any> = {
        ...data,
        price: data.price ? Number(data.price) : product.price,
        reorder_threshold: data.reorder_threshold ? Number(data.reorder_threshold) : product.reorder_threshold,
        seller: data.seller || product.seller._id,
        category: data.category || product.category._id,
        brand: data.brand || product.brand?._id,
      };

      // Remove any undefined or empty values
      Object.keys(formattedData).forEach(key => {
        if (formattedData[key] === undefined || formattedData[key] === '') {
          delete formattedData[key];
        }
      });

      console.log('Sending update with data:', formattedData);
      
      const res = await updateProduct({ id: product.key, payload: formattedData }).unwrap();
      if (res.statusCode === 200) {
        toastMessage({ icon: 'success', text: res.message });
        reset();
        handleCancel();
      }
    } catch (error: any) {
      console.error('Update error:', error);
      handleCancel();
      toastMessage({ icon: 'error', text: error.data.message });
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        onClick={showModal}
        type='primary'
        className='table-btn-small'
        style={{ backgroundColor: 'green', display: 'flex', gap: '8px', justifyContent: 'center'  }}
      >
        <EditFilled />
      </Button>
      <Modal 
  title={<div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>Update Product Info</div>} 
  open={isModalOpen} 
  onCancel={handleCancel} 
  footer={null}
>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CustomInput
            name='name'
            errors={errors}
            label='Name'
            register={register}
            required={true}
          />
          <CustomInput
            errors={errors}
            label='Price'
            type='number'
            name='price'
            register={register}
            required={true}
          />
          <CustomInput
            errors={errors}
            label='Reorder Threshold'
            type='number'
            name='reorder_threshold'
            register={register}
            required={true}
            tooltip="Minimum stock level before warning. When stock falls below this number, a warning will appear."
          />
          <Row>
            <Col xs={{ span: 23 }} lg={{ span: 6 }}>
              <label htmlFor='Size' className='label'>
                Seller
              </label>
            </Col>
            <Col xs={{ span: 23 }} lg={{ span: 18 }}>
              <select
                disabled={isSellerLoading}
                {...register('seller', { required: true })}
                className={`input-field ${errors['seller'] ? 'input-field-error' : ''}`}
              >
                <option value=''>Select Seller*</option>
                {sellers?.data.map((item: ICategory) => (
                  <option value={item._id} key={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Col>
          </Row>

          <Row>
            <Col xs={{ span: 23 }} lg={{ span: 6 }}>
              <label htmlFor='Size' className='label'>
                Category
              </label>
            </Col>
            <Col xs={{ span: 23 }} lg={{ span: 18 }}>
              <select
                {...register('category', { required: true })}
                className={`input-field ${errors['category'] ? 'input-field-error' : ''}`}
              >
                <option value=''>Select Category*</option>
                {categories?.data.map((item: ICategory) => (
                  <option value={item._id} key={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Col>
          </Row>

          <Row>
            <Col xs={{ span: 23 }} lg={{ span: 6 }}>
              <label htmlFor='Size' className='label'>
                Brand
              </label>
            </Col>
            <Col xs={{ span: 23 }} lg={{ span: 18 }}>
              <select
                {...register('brand')}
                className={`input-field ${errors['brand'] ? 'input-field-error' : ''}`}
              >
                <option value=''>Select brand</option>
                {brands?.data.map((item: ICategory) => (
                  <option value={item._id} key={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Col>
          </Row>

          <CustomInput label='Description' name='description' register={register} />

          <Row>
            <Col xs={{ span: 23 }} lg={{ span: 6 }}>
              <label htmlFor='Size' className='label'>
                Size
              </label>
            </Col>
            <Col xs={{ span: 23 }} lg={{ span: 18 }}>
              <select className={`input-field`} {...register('size')}>
                <option value=''>Select Product Size</option>
                <option value='SMALL'>Small</option>
                <option value='MEDIUM'>Medium</option>
                <option value='LARGE'>Large</option>
              </select>
            </Col>
          </Row>
          <Flex justify='center'>
            <Button
              htmlType='submit'
              type='primary'
              style={{ textTransform: 'uppercase', fontWeight: 'bold' }}
            >
              Update
            </Button>
          </Flex>
        </form>
      </Modal>
    </>
  );
};

/**
 * Delete Product Modal
 */
const DeleteProductModal = ({ id }: { id: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteProduct] = useDeleteProductMutation();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteProduct(id).unwrap();
      if (res.statusCode === 200) {
        toastMessage({ icon: 'success', text: res.message });
        handleCancel();
      }
    } catch (error: any) {
      handleCancel();
      toastMessage({ icon: 'error', text: error.data.message });
    }
  };

  return (
    <>
      <Button
        onClick={showModal}
        type='primary'
        className='table-btn-small'
        style={{ backgroundColor: 'red' ,display: 'flex', gap: '8px', justifyContent: 'center' }}
      >
        <DeleteFilled />
      </Button>
      <Modal 
  title={<div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>Delete Product</div>} 
  open={isModalOpen} 
  onCancel={handleCancel} 
  footer={null}
>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Are you want to delete this product?</h2>
          <h4>You won't be able to revert it.</h4>
          <div
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}
          >
            <Button
              onClick={handleCancel}
              type='primary'
              style={{ backgroundColor: 'lightseagreen' }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleDelete(id)}
              type='primary'
              style={{ backgroundColor: 'red' }}
            >
              Yes! Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProductManagePage;
