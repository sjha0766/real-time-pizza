const moment = require('moment/moment');
const Order=require('../../../models/order');
function orderController() {
    return {
         store(req, res) {
            const { phone, address} = req.body
            if(!phone || !address) {
                req.flash('error','All Fields are required');
                return res.redirect('/cart');
            }
            const order=new Order({
                    customerId: req.user._id,
                    items: req.session.cart.items,
                    phone,
                    address 
            })
            order.save().then(result=>{
                Order.populate(result,{path:'customerId'},(err,placedOrder)=>{
                    req.flash('success','Order Placed Successfully');
                    delete req.session.cart
    
                    const eventEmitter = req.app.get('eventEmitter')
                    eventEmitter.emit('orderPlaced', placedOrder)
                    return res.redirect('/customer/orders'); 
                })
                
            }).catch(err=>{
                req.flash('error','Something went wrong')
                return res.redirect('/cart');
            })
        },
        async index(req, res){
         const orders= await Order.find({customerId:req.user._id},
         null,
         { sort: { 'createdAt': -1 } })
         res.header('Cache-Control','no-cache , private , no-store , must-revalidate , max-stale=0, post-check=0 , pre-check=0')
         res.render('customers/orders', { orders: orders, moment: moment })
        },
        async show(req, res) {
            try {
                const order = await Order.findById(req.params.id);
        
                // Check if the order exists
                if (!order) {
                    return res.status(404).send('Order not found');
                }
        
                // Authorize user
                if (req.user._id.toString() === order.customerId.toString()) {
                    return res.render('customers/singleOrder', { order });
                }
        
                return res.redirect('/');
            } catch (error) {
                console.error(error);
                return res.status(500).send('Internal Server Error');
            }
        }
        
    };
}

module.exports = orderController;
