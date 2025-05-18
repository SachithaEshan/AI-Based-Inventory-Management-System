import {Col, Flex, Row, Slider} from 'antd';
import React from 'react';
import {useGetAllCategoriesQuery} from '../../redux/features/management/categoryApi';
import {useGetAllBrandsQuery} from '../../redux/features/management/brandApi';

interface ProductManagementFilterProps {
  query: {
    name: string;
    category: string;
    brand: string;
    limit: number;
    page: number;
    minPrice: number;
    maxPrice: number;
  };
  setQuery: (newQuery: Partial<{
    name: string;
    category: string;
    brand: string;
    limit: number;
    page: number;
    minPrice: number;
    maxPrice: number;
  }>) => void;
}

const ProductManagementFilter = ({query, setQuery}: ProductManagementFilterProps) => {
  const {data: categories} = useGetAllCategoriesQuery(undefined);
  const {data: brands} = useGetAllBrandsQuery(undefined);

  const handlePriceChange = (value: number[]) => {
    setQuery({
      minPrice: value[0],
      maxPrice: value[1],
    });
  };

  return (
    <Flex
      style={{
        border: '1px solid grey',
        padding: '1rem',
        marginBottom: '.5rem',
        borderRadius: '1rem',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.4) inset',
      }}
    >
      <Row gutter={2} style={{width: '100%'}}>
        <Col xs={{span: 24}} md={{span: 8}}>
          <label style={{fontWeight: 700}}>Price Range</label>
          <Slider
            range
            step={1}
            min={0}
            max={20000}
            value={[query.minPrice, query.maxPrice]}
            onChange={handlePriceChange}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span>${query.minPrice}</span>
            <span>${query.maxPrice}</span>
          </div>
        </Col>
        <Col xs={{span: 24}} md={{span: 8}}>
          <label style={{fontWeight: 700}}>Search by product name</label>
          <input
            type='text'
            value={query.name}
            className={`input-field`}
            placeholder='Search by Product Name'
            onChange={(e) => setQuery({ name: e.target.value })}
          />
        </Col>
        <Col xs={{span: 24}} md={{span: 4}}>
          <label style={{fontWeight: 700}}>Filter by Category</label>
          <select
            name='category'
            className={`input-field`}
            value={query.category}
            onChange={(e) => setQuery({ category: e.target.value })}
          >
            <option value=''>Filter by Category</option>
            {categories?.data?.map((category: {_id: string; name: string}) => (
              <option value={category._id} key={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </Col>
        <Col xs={{span: 24}} md={{span: 4}}>
          <label style={{fontWeight: 700}}>Filter by Brand</label>
          <select
            name='Brand'
            className={`input-field`}
            value={query.brand}
            onChange={(e) => setQuery({ brand: e.target.value })}
          >
            <option value=''>Filter by Brand</option>
            {brands?.data?.map((brand: {_id: string; name: string}) => (
              <option value={brand._id} key={brand._id}>
                {brand.name}
              </option>
            ))}
          </select>
        </Col>
      </Row>
    </Flex>
  );
};

export default ProductManagementFilter;
