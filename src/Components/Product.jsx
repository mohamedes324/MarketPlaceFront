import React from "react";
import "./product.css";

const Product = ({product,
    children, // إضافة children للأزرار
  }) => {
    return (
      <div className="product">
        <img src={product.imageUrl} alt={product.title} className="product-image" />

        <div className="name-product">{product.title}</div>
  
        <div className="product-info">
          <div className="price">${product.price}</div>
        </div>
  
          {children}

      </div>
      
    );
  };
  
export default Product;
