const express = require('express');
const pool = require('./db');
const bcrypt = require("bcrypt");
const router = express.Router();

router.post('/products', async (req, res) => {
    const { name, price, description, category, imageUrl } = req.body;
    let connection;
    try {
      connection = await pool.getConnection();
      const [result] = await connection.execute(
        'INSERT INTO product (name, category, description, img_url, price) VALUES (?, ?, ?, ?, ?)',
        [name, category, description, imageUrl, price]
      );
  
  
      if (result.affectedRows === 1) {
        res.status(200).json({ message: 'Product Added Successfully' });
      } else {
        res.status(500).json({ message: 'Error adding product' });
      }
    } catch (error) {
      console.error('Error adding product:', error);
      res.status(500).json({ message: 'Error adding product' });
    }finally {
      if (connection) connection.release();
    }
  });
  

  router.delete('/products', async (req, res) => {
    const { productId } = req.query;
    let connection;
    try {
      connection = await pool.getConnection();;
  

      const [result] = await connection.execute(
        'DELETE FROM product WHERE product_id = ?',
        [productId]
      );
  
  
      if (result.affectedRows === 1) {
        res.status(200).json({ message: 'Product Deleted Successfully' });
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Error deleting product' });
    }finally {
      if (connection) connection.release();
    }
  });
  

  router.put('/products', async (req, res) => {
    const { productId, name, description, price, imgUrl, category } = req.body;
    let connection;
    try {
      connection = await pool.getConnection();;
  

      const [result] = await connection.execute(
        `UPDATE product 
         SET 
           name = ?, 
           category = ?, 
           description = ?, 
           img_url = ?, 
           price = ? 
         WHERE product_id = ?`,
        [name, category, description, imgUrl, price, productId]
      );
  
      
  
      if (result.affectedRows === 1) {
        res.status(200).json({ message: 'Product Updated Successfully' });
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ message: 'Error updating product' });
    }finally {
      if (connection) connection.release();
    }
  });
  

  router.get('/products', async (req, res) => {
    const { userInput } = req.query;
    const pattern = `%${userInput}%`;
    let connection;
    
    try {
      connection = await pool.getConnection();
      const [result] = await connection.execute(
        'SELECT * FROM product WHERE description LIKE ? OR category LIKE ?',
        [pattern, pattern]
      );
  
      
  
      if (result.length === 0) {
        const [defaultResult] = await connection.execute(
          'SELECT * FROM product WHERE description LIKE ?',
          ['%A%']
        );
        res.status(200).json(defaultResult);
      } else {
        res.status(200).json(result);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({ message: 'Error searching products' });
    }finally {
      if (connection) connection.release();
      // console.log("connection end")
    }
  });

router.put('/products', async (req, res) => {
    const productId = req.query.productId;
    const { name, category, price, imgUrl, description } = req.body;
    let connection;
    try {
      connection = await pool.getConnection();
      try {

        const [result] = await connection.execute(
          `UPDATE product SET name = ?, category = ?, price = ?, img_url = ?, description = ? WHERE product_id = ?`,
          [name, category, price, imgUrl, description, productId]
        );

        if (result.affectedRows > 0) {
          res.status(200).json({ message: 'Product updated successfully' });
        } else {
          res.status(404).json({ message: 'Product not found' });
        }
      } finally {
      }
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }finally {
      if (connection) connection.release();
    }
  });


router.post('/signup', async (req, res) => {
    const { userName, phoneNumber, email, password, adderss } = req.body;
    if (userName.length < 2) {
        res.json({ message: 'The length of name should be above 2', status: 404 });
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        res.json({ message: 'The length of the email should be above 5 characters', status: 404 });
    } else if (password.length < 4) {
        res.json({ message: 'The length of the Password should be above 3 characters', status: 404 });
    } else {
        let connection;
        try{
          connection = await pool.getConnection();;
          if (connection) {
              try {
                  const [existingUser] = await connection.execute("SELECT * FROM users WHERE email = ?", [email]);
                  if (existingUser.length > 0) {
                      res.json({ message: 'Email already exists', status: 404 });
                  } else {
                      const encodePassword = await bcrypt.hash(password, 10);
                      await connection.execute(
                          "INSERT INTO users (name, mobile_number, email, password, adderss) VALUES (?, ?, ?, ?, ?)",
                          [userName, phoneNumber, email, encodePassword, adderss]
                      );
                      res.json({ message: 'Registration Success', status: 200 });
                  }
              } catch (error) {
                  console.error(error);
                  res.status(500).json({ message: 'Error while creating user', status: 502 });
              }finally {
                if (connection) connection.release();
              }
          } else {
              res.status(500).json({ message: 'Database connection failed' });
          }
        }catch(error){
          res.status(500).json({ message: 'Error while creating user', status: 502 });
        }finally {
          if (connection) connection.release();
        }
        
    }
});


router.post('/login', async (req, res) => {
  const { email, password, AdminPassword } = req.body;
  if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password', status: 400 });
  }
  let connection;
  try {
      connection = await pool.getConnection();;
      const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);

      if (rows.length > 0) {
          const user = rows[0];
          const storedPassword = user.password;
          const passwordMatch = await bcrypt.compare(password, storedPassword);

          if (passwordMatch) {
              if (AdminPassword !== "null") {
                  if (AdminPassword === "IAMadmin@36") {
                      res.status(200).json({
                          message: 'Admin User Checking Success',
                          status: 200,
                          user_id: user.user_id,
                          user_name: user.name,
                          email: user.email,
                          phoneNumber: user.mobile_number,
                          address: user.adderss
                      });
                  } else {
                      res.status(200).json({ message: 'Invalid Admin', status: 200 });
                  }
              } else {
                  res.status(200).json({
                      message: 'User Checking Success',
                      status: 200,
                      user_id: user.user_id,
                      user_name: user.name,
                      email: user.email,
                      phoneNumber: user.mobile_number,
                      address: user.adderss
                  });
              }
          } else {
              res.json({ message: 'Invalid Password/email', status: 502 });
          }
      } else {
          res.json({ message: 'Invalid Password/email', status: 404 });
      }
  } catch (error) {
      console.error('Error while login:', error);
      res.json({ message: 'Error while login', status: 502 });
  }finally {
    if (connection) connection.release();
  }
});

router.post('/Cart', async (req, res) => {
    const { userId, productId } = req.body;
    let connection;
    try{
      connection = await pool.getConnection();;
      if (connection) {
          try {
              const [result] = await connection.execute("SELECT * FROM cart WHERE user_id = ? AND product_id = ?", [userId, productId]);
              if (result.length > 0) {
                  res.json({ message: 'Success', status: 200 });
              } else {
                  await connection.execute("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, 1)", [userId, productId]);
                  res.json({ message: 'Success', status: 200 });
              }
          } catch (error) {
              console.error(error);
              res.status(500).json({ message: 'Error', status: 404 });
          }finally {
            if (connection) connection.release();
          }
      } else {
          res.status(500).json({ message: 'Database connection failed' });
      }
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error', status: 404 });
    }finally {
      if (connection) connection.release();
    }
    
});

router.delete('/Cart', async (req, res) => {
    const { userId, productId } = req.query;
    // console.log(req.query)
    let connection;
    try{
      connection = await pool.getConnection();;
      if (connection) {
          try {
              await connection.execute("DELETE FROM cart WHERE user_id = ? AND product_id = ?", [userId, productId]);
              const [result] = await connection.execute("SELECT * FROM cart WHERE user_id = ? AND product_id = ?", [userId, productId]);
              if (result.length === 0) {
                  res.json({ message: 'Success', status: 200 });
              } else {
                  res.json({ message: 'Error', status: 404 });
              }
          } catch (error) {
              console.error(error);
              res.status(500).json({ message: 'Error', status: 404 });
          }finally {
            if (connection) connection.release();
          }
      } else {
          res.status(500).json({ message: 'Database connection failed' });
      }
    }catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error', status: 404 });
  }finally {
    if (connection) connection.release();
  }
    
});

router.put('/Cart', async (req, res) => {
    const { userId, productId, quantity } = req.body;
    let connection;
    try{
      connection = await pool.getConnection();;
      if (connection) {
          try {
              await connection.execute("UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?", [quantity, userId, productId]);
              const [result] = await connection.execute("SELECT * FROM cart WHERE user_id = ? AND product_id = ?", [userId, productId]);
              if (result.length !== 0) {
                  res.json({ message: 'Success', status: 200 });
              } else {
                  res.json({ message: 'Error', status: 404 });
              }
          } catch (error) {
              console.error(error);
              res.status(500).json({ message: 'Error', status: 404 });
          }finally {
            if (connection) connection.release();
          }
      } else {
          res.status(500).json({ message: 'Database connection failed' });
      }
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error', status: 404 });
    }finally {
      if (connection) connection.release();
    }
    
});

router.get('/Cart/cartItems', async (req, res) => {
    const { userId } = req.query;
    let connection;
    try{
      connection = await pool.getConnection();;
      if (connection) {
          try {
              const [cart] = await connection.execute(
                  `SELECT p.*, c.quantity 
                  FROM product p 
                  JOIN cart c ON p.product_id = c.product_id 
                  WHERE c.user_id = ?`,
                  [userId]
              );
              res.status(200).json({ message: 'Success', status: 200, products: cart });
          } catch (error) {
              console.error(error);
              res.status(500).json({ message: 'Error', status: 404 });
          }finally {
            if (connection) connection.release();
          }
      } else {
          res.status(500).json({ message: 'Database connection failed' });
      }
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error', status: 404 });
    }finally {
      if (connection) connection.release();
    }
    
});


router.post('/Order', async (req, res) => {
  let { userId, buyingItems, totalPrice } = req.body;
  buyingItems = JSON.parse(buyingItems);

  if (!userId || !buyingItems) {
      return res.status(400).json({ message: 'Missing required fields', status: 400 });
  }
  buyingItems.push({ totalPrice });
  let connection;
  try {
      connection = await pool.getConnection();;
      await connection.execute(
          `INSERT INTO \`order\` (user_id, order_item) VALUES (?, ?)`,
          [userId, JSON.stringify(buyingItems)]
      );
      res.json({ message: 'Order Placed', status: 200 });
  } catch (error) {
      console.error('Error inserting order:', error);
      res.status(500).json({ message: 'Error', status: 500 });
  }finally {
    if (connection) connection.release();
  }
});




router.get('/Order', async (req, res) => {
    const { userId } = req.query;
    let connection;
    try{
      connection = await pool.getConnection();;
      if (connection) {
          try {
              const [orders] = await connection.execute(
                  `SELECT p.*, o.quantity, o.total_price 
                  FROM product p 
                  JOIN orders o ON p.product_id = o.product_id 
                  WHERE o.user_id = ?`,
                  [userId]
              );
              res.json(orders);
          } catch (error) {
              console.error(error);
              res.status(500).json({ message: 'Error', status: 404 });
          }finally {
            if (connection) connection.release();
          }
      } else {
          res.status(500).json({ message: 'Database connection failed' });
      }
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error', status: 404 });
    }finally {
      if (connection) connection.release();
    }
    
});

router.put('/user', async (req, res) => {
    const { id, name, email, mobileNumber, address } = req.body;
    const adderss = address
    const mobile_number = mobileNumber
    // console.log(req.body)
    if (!id || !name || !email || !mobile_number || !adderss) {
      return res.status(400).json({ message: 'Missing required fields', status: 400 });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format', status: 400 });
    }
    let connection;
    try {
      connection = await pool.getConnection();;
      const query = `UPDATE users
                     SET name = ?, email = ?, mobile_number = ?, adderss = ?
                     WHERE user_id = ?`;

      const [result] = await connection.execute(query, [name, email, mobile_number, adderss, id]);
      
  
      if (result.affectedRows > 0) {
        res.json({ message: 'User details updated successfully', status: 200 });
      } else {
        res.json({ message: 'User not found or no changes made', status: 404 });
      }
    } catch (error) {
      console.error('Error updating user details:', error);
      res.status(500).json({ message: 'Internal server error', status: 500 });
    }finally {
      if (connection) connection.release();
    }
  });
  function isValidEmail(email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
  }

router.get('/getusers', async (req, res) => {
    let connection;
    try{
      connection = await pool.getConnection();;
      if (connection) {
          try {
              const [users] = await connection.execute("SELECT * FROM user");
              res.json(users);
          } catch (error) {
              console.error(error);
              res.status(500).json({ message: 'Error fetching users' });
          }finally {
            if (connection) connection.release();
          }
      } else {
          res.status(500).json({ message: 'Database connection failed' });
      }
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching users' });
    }finally {
      if (connection) connection.release();
    }
    
});

module.exports = router;
