import React from 'react';
import PropTypes from 'prop-types';

export default function Card({ children, className = '', hover = false, as: Tag = 'div', ...rest }) {
  return (
    <Tag
      className={`card-base ${hover ? 'card-hover cursor-pointer' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hover: PropTypes.bool,
  as: PropTypes.elementType,
};
