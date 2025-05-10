import React from 'react'
import styles from "./category.module.css";

const Category = ({category , children}) => {
  return (
        <div key={category.id} className={styles.category}>
            <img src={category.imgUrl} alt={category.name} className={styles["categoty-img"]}/>
            <h2 className={styles["category-name"]}>{category.name}</h2>
            {children}
        </div>
  )
}

export default Category
