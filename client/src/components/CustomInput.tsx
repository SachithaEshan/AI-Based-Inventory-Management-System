import { Col, Row, Tooltip } from 'antd';

interface Props {
  name: string;
  errors?: any;
  label: string;
  type?: string;
  register: any;
  required?: boolean;
  defaultValue?: any;
  tooltip?: string;
}

const CustomInput = ({
  name,
  errors = {},
  required = false,
  label,
  register,
  type = 'text',
  tooltip
}: Props) => {
  return (
    <Row>
      <Col xs={{ span: 23 }} lg={{ span: 6 }}>
        <label htmlFor={name} className='label'>
          {label}
          {tooltip && (
            <Tooltip title={tooltip}>
              <span style={{ marginLeft: '5px', cursor: 'help' }}>ⓘ</span>
            </Tooltip>
          )}
        </label>
      </Col>
      <Col xs={{ span: 23 }} lg={{ span: 18 }}>
        <input
          id={name}
          type={type}
          placeholder={label}
          {...register(name, { required: required })}
          className={`input-field ${errors[name] ? 'input-field-error' : ''}`}
        />
      </Col>
    </Row>
  );
};

export default CustomInput;
