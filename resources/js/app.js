import axios from 'axios';
import Noty from 'noty';
import { initAdmin } from './admin';
import moment from 'moment';
// import io from 'socket.io-client';  // Make sure to import the Socket.IO client library

const addToCartButtons = document.querySelectorAll('.add-to-cart');
const cartCounter = document.querySelector('#cartCounter');

function updateCart(pizza) {
    axios.post('/update-cart', pizza)
        .then((res) => {
            cartCounter.innerText = res.data.totalQty;
            new Noty({
                type: 'success',
                timeout: 1000,
                text: 'Item added to cart',
                progressBar: false,
            }).show();
        })
        .catch((err) => {
            console.error('Error updating cart:', err);
            new Noty({
                type: 'error',
                timeout: 1000,
                text: 'Something went wrong',
                progressBar: false,
            }).show();
        });
}

addToCartButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        const pizza = JSON.parse(btn.dataset.pizza);
        updateCart(pizza);
    });
});

const alertMsg = document.querySelector('#success-alert');
if (alertMsg) {
    setTimeout(() => {
        alertMsg.remove();
    }, 2000);
}

// Change order status
const statuses = document.querySelectorAll('.status_line');
const hiddenInput = document.querySelector('#hiddenInput');
let order = hiddenInput ? JSON.parse(hiddenInput.value) : null;
const time = document.createElement('small');

function updateStatus(orderData) {
    statuses.forEach((status) => {
        status.classList.remove('step-completed');
        status.classList.remove('current');
    });

    let stepCompleted = true;
    statuses.forEach((status) => {
        const dataProp = status.dataset.status;

        if (stepCompleted) {
            status.classList.add('step-completed');
        }

        if (dataProp === orderData.status) {
            stepCompleted = false;
            time.innerText = moment(orderData.updatedAt).format('hh:mm A');
            status.appendChild(time);

            if (status.nextElementSibling) {
                status.nextElementSibling.classList.add('current');
            }
        }
    });
}

updateStatus(order);

const socket = io();  // Connect to Socket.IO server

// Join rooms
if (order) {
    socket.emit('join', `order_${order._id}`);
}

const adminAreaPath = window.location.pathname;
if (adminAreaPath.includes('admin')) {
    initAdmin(socket);
    socket.emit('join', 'adminRoom');
}

socket.on('orderUpdated', (data) => {
    const updatedOrder = { ...order, updatedAt: moment().format(), status: data.status };
    updateStatus(updatedOrder);

    new Noty({
        type: 'success',
        timeout: 1000,
        text: 'Order updated',
        progressBar: false,
    }).show();
});
