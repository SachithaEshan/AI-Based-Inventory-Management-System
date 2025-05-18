import { DeleteFilled, EditFilled } from '@ant-design/icons';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Flex, Modal, Pagination, Table, Form, Input } from 'antd';
import { useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import {
  useDeleteSellerMutation,
  useGetAllSellerQuery,
  useUpdateSellerMutation,
} from '../../redux/features/management/sellerApi';
import { IProduct, ISeller } from '../../types/product.types';
import toastMessage from '../../lib/toastMessage';
import SearchInput from '../../components/SearchInput';

const SellerManagementPage = () => {
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: '',
  });

  const { data, isFetching, refetch } = useGetAllSellerQuery(query);

  const onChange: PaginationProps['onChange'] = (page) => {
    setQuery((prev) => ({ ...prev, page: page }));
  };

  const tableData = data?.data?.map((seller: ISeller) => ({
    key: seller._id,
    name: seller.name,
    email: seller.email,
    contactNo: seller.contactNo,
  }));

  const columns: TableColumnsType<any> = [
    {
      title: 'Seller Name',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: 'Email',
      key: 'email',
      dataIndex: 'email',
      align: 'center',
    },
    {
      title: 'Contact Number',
      key: 'contactNo',
      dataIndex: 'contactNo',
      align: 'center',
    },
    {
      title: 'Action',
      key: 'x',
      align: 'center',
      render: (item) => {
        return (
          <div style={{ display: 'flex' }}>
            <UpdateModal product={item} onSuccess={refetch} />
            <DeleteModal id={item.key} onSuccess={refetch} />
          </div>
        );
      },
      width: '1%',
    },
  ];

  return (
    <>
      <Flex justify='end' style={{ margin: '5px' }}>
        <SearchInput setQuery={setQuery} placeholder='Search Seller...' />
      </Flex>
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
          defaultPageSize={query.limit}
          total={data?.meta?.total}
        />
      </Flex>
    </>
  );
};

/**
 * Update Modal
 */
const UpdateModal = ({ product, onSuccess }: { product: ISeller; onSuccess: () => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { handleSubmit, register, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: product.name,
      email: product.email,
      contactNo: product.contactNo,
    }
  });
  const [updateSeller] = useUpdateSellerMutation();

  const showModal = () => {
    reset({
      name: product.name,
      email: product.email,
      contactNo: product.contactNo,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: FieldValues) => {
    try {
      console.log('Starting seller update with data:', { id: product._id, data });
      const res = await updateSeller({ 
        id: product._id, 
        payload: {
          name: data.name,
          email: data.email,
          contactNo: data.contactNo
        }
      }).unwrap();
      
      console.log('Update response:', res);
      
      if (res.status === 'success') {
        toastMessage({ icon: 'success', text: res.message || 'Seller updated successfully' });
        onSuccess(); // Use the passed refetch function
        handleCancel();
      } else {
        throw new Error(res.message || 'Failed to update seller');
      }
    } catch (error: any) {
      console.error('Update error:', error);
      toastMessage({ 
        icon: 'error', 
        text: error.data?.message || error.message || 'Failed to update seller' 
      });
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    reset();
  };

  return (
    <>
      <Button
        onClick={showModal}
        type='primary'
        className='table-btn-small'
        style={{ backgroundColor: 'green', marginRight: '8px' }}
      >
        <EditFilled />
      </Button>
      <Modal 
        title='Update Seller Info' 
        open={isModalOpen} 
        onCancel={handleCancel} 
        footer={null}
        destroyOnClose={true}
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(onSubmit)(e);
        }}>
          <Form layout="vertical">
            <Form.Item label="Name" required>
              <Input
                {...register('name', { required: 'Name is required' })}
                placeholder="Enter seller name"
                defaultValue={product.name}
              />
              {errors.name && <span style={{ color: 'red' }}>{errors.name.message}</span>}
            </Form.Item>

            <Form.Item label="Email" required>
              <Input
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                placeholder="Enter email address"
                defaultValue={product.email}
              />
              {errors.email && <span style={{ color: 'red' }}>{errors.email.message}</span>}
            </Form.Item>

            <Form.Item label="Contact Number" required>
              <Input
                {...register('contactNo', { 
                  required: 'Contact number is required',
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: 'Please enter a valid 10-digit phone number'
                  }
                })}
                placeholder="Enter contact number"
                defaultValue={product.contactNo}
              />
              {errors.contactNo && <span style={{ color: 'red' }}>{errors.contactNo.message}</span>}
            </Form.Item>

            <Form.Item>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <Button onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" style={{ backgroundColor: 'green' }}>
                  Update
                </Button>
              </div>
            </Form.Item>
          </Form>
        </form>
      </Modal>
    </>
  );
};

/**
 * Delete Modal
 */
const DeleteModal = ({ id, onSuccess }: { id: string; onSuccess: () => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteSeller] = useDeleteSellerMutation();

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteSeller(id).unwrap();
      if (res.statusCode === 200) {
        toastMessage({ icon: 'success', text: res.message });
        onSuccess(); // Trigger refetch
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
        className='table-btn-small'
        style={{ backgroundColor: 'red' }}
      >
        <DeleteFilled />
      </Button>
      <Modal title='Delete Product' open={isModalOpen} onCancel={handleCancel} footer={null}>
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

export default SellerManagementPage;
