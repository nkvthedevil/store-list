$(document).ready(function () {

    class Store {
        constructor(id, name, address, hours, products) {
            this.id = id || Date.now();
            this.name = name || 'Store Name';
            this.address = address || 'Store address';
            this.hours = hours || '9.00-17.00';
            this.products = products || [new Product()];
        }
    }

    class Product {
        constructor(name, quantity, price) {
            this.name = name || 'test';
            this.quantity = quantity || '0';
            this.price = price || '0';
        }
    }

    let storeList = [
        new Store(123, 'Galileo', 'ул. Бобруйская 6, Минск', '9.00-22.00', [
            new Product('panama', '13', '15'),
            new Product('t-shirt', '20', '5'),
            new Product('skirt', '13', '27')
        ]),
        new Store(234, 'Galleria', 'пр. Победителей 9, Минск', '10.00-23.00', [
            new Product('trousers', '12', '45'),
            new Product('jackets', '7', '125')
        ]),
        new Store(345, 'ТД на Немиге', 'ул. Немига 10, Минск', '10.00-21.00', [
            new Product('pajama', '25', '10'),
            new Product('hat', '3', '40')
        ])
    ];

    const activeClass = 'bg-light';
    const editClass = 'js-edit-data';

    const storeCard = $('.js-store-card').clone();
    $('.js-store-card').remove();

    //generate store list
    storeList.forEach(function (item, i) {
        let serialStore = JSON.stringify(item);
        let id = item.id;

        sessionStorage.setItem(id, serialStore);
        storeCard.clone().attr('id', id).appendTo('.js-stores-list');
        setCardData(item, i);
    });

    function setCardData(item) {
        let card = $('.js-store-card#' + item.id);
        let num = card.index() + 1;

        card.find('.card-title').text(item.name);
        card.find('.badge').text(num);
        card.find('.card-subtitle').text(item.hours);
        card.find('.card-text').text(item.address);
    }

    function getCardData(item) {
        let id = item.attr('id');
        let name = item.find('.card-title').text();
        let hours = item.find('.card-subtitle').text();
        let address = item.find('.card-text').text();
        let products = (JSON.parse(sessionStorage.getItem(id))).products;

        let store = new Store(id, name, address, hours, products);

        return JSON.stringify(store);
    }

    function showProducts(id) {
        let tbody = $('.js-products-table tbody');
        let storeInfo = JSON.parse(sessionStorage.getItem(id));

        tbody.attr('data-id', id);
        tbody.find('tr').remove();

        storeInfo.products.forEach(function (item, i) {
            setProductLine(item, i);
        });

        $('.js-store-card').removeClass(activeClass);
        $('.js-store-card#' + id).addClass(activeClass);
    }

    showProducts(storeList[0].id);

    function setProductLine(item, i) {
        let tr = $('<tr>');
        let td = $('<td class="' + editClass + '" style="white-space: nowrap;">');
        let buttons = $('<td class="text-right"><button class="btn btn-sm btn-danger js-delete-product-btn">X</button></td>');
        let tbody = $('.js-products-table tbody');

        tbody.append(tr.clone());
        $('tbody tr').last().append(td.clone().text(i).addClass('number').removeClass(editClass))
            .append(td.clone().addClass('product-name').text(item.name))
            .append(td.clone().addClass('product-quantity').text(item.quantity))
            .append(td.clone().addClass('product-price').text(item.price))
            .append(buttons.clone());
    }

    //show products table
    $('.js-stores-list').on('click', '.js-products-link', (function () {
        if (!$(this).hasClass(activeClass)) {
            $('.js-store-card.' + activeClass).find('.js-edit-store-btn.active').click();
            $('.js-edit-products-btn.active').click();
        }
        showProducts($(this).closest('.js-store-card').attr('id'));
    }));

    //add new store
    $('.js-add-store-btn').click(function () {
        let store = new Store();
        let id = store.id;

        sessionStorage.setItem(id, JSON.stringify(store));
        storeCard.clone().attr('id', id).appendTo('.js-stores-list');
        setCardData(store);
        showProducts(id);
    });

    //delete store
    $('.js-stores-list').on('click', '.js-delete-store-btn', (function () {
        let card = $(this).closest('.js-store-card');
        let id = card.attr('id');
        let badges = card.nextAll().find('.badge');

        badges.each(function () {
            $(this).text($(this).text() - 1);
        });

        if (card.hasClass(activeClass)) {
            let prev = card.prev();
            let next = card.next();
            if (prev.length > 0) {
                prev.addClass(activeClass);
                showProducts(prev.attr('id'));
            }
            else if (next.length > 0) {
                next.addClass(activeClass);
                showProducts(next.attr('id'));
            }
        }

        if ($('.js-store-card').length > 1) {
            card.remove();
            sessionStorage.removeItem(id);
        }
    }));

    //edit store
    $('.js-stores-list').on('click', '.js-edit-store-btn', (function () {
        let btn = $(this);
        let card = btn.closest('.js-store-card');
        let id = card.attr('id');

        if (btn.hasClass('active')) {
            btn.text('edit');
            card.find('.'+editClass).css('background-color','inherit');
            sessionStorage.setItem(id, getCardData(card));
        }
        else {
            btn.text('save');
            card.find('.'+editClass).css('background-color','#cfc');
            $('.js-store-card.' + activeClass).find('.js-edit-store-btn.active').click();
            $('.js-edit-products-btn.active').click();
        }

        showProducts(id);
        editInPlace(card, btn);

    }));

    function editInPlace(item, editButton) {
        item.on('click', '.' + editClass, function () {
            if (editButton.hasClass('active')) {

                let el = $(this);
                let margin = el.css('margin');
                let input;

                input = $('<input class="d-block" style="width: 100%; padding:0; border-width: 0; "/>').css('margin',margin).val(el.text());

                /* lines commented below are bugged - editable text disappears from input when
                you edit it again after saving :( */

                /*if (el.is('td')) {
                    el.text('').append(input);
                }
                else*/ el.replaceWith(input);

                let save = function () {
                    if (input.val()=='') input.val('null');
                    let newEl = el.text(input.val());
                    /*if (el.is('td')) el.replaceWith(newEl);
                    else*/ input.replaceWith(newEl);
                };

                input.one('blur', save).focus();
            }
        });
    }

    //add new product
    $('.js-products-table').on('click', '.js-add-product-btn', function () {
        let product = new Product();
        let id = $('tbody').attr('data-id');
        let store = JSON.parse(sessionStorage.getItem(id));

        setProductLine(product, $('tbody tr').length);

        store.products[store.products.length] = product;
        sessionStorage.setItem(id, JSON.stringify(store));
    });

    //delete product
    $('.js-products-table').on('click', '.js-delete-product-btn', (function () {
        let id = $('tbody').attr('data-id');
        let store = JSON.parse(sessionStorage.getItem(id));
        let product = $(this).closest('tr');
        let numbers = product.nextAll().find('.number');

        store.products.splice(product.find('.number').text(), 1);

        numbers.each(function () {
            $(this).text($(this).text() - 1);
        });

        product.remove();
        sessionStorage.setItem(id, JSON.stringify(store));
    }));

    //edit products table
    $('.js-products-table').on('click', '.js-edit-products-btn', (function () {
        let btn = $(this);
        let table = $('tbody tr');
        let id = $('tbody').attr('data-id');
        let storeData = JSON.parse(sessionStorage.getItem(id));
        let products = [];

        if (btn.hasClass('active')) {
            btn.text('edit');
            table.find('.'+editClass).css('background-color','inherit');

            table.each(function () {
                let data = $(this).find('.' + editClass);
                let name = data.filter('.product-name').text();
                let quantity = data.filter('.product-quantity').text();
                let price = data.filter('.product-price').text();
                products.push(new Product(name, quantity, price));
            });

            storeData.products = products;
            sessionStorage.setItem(id, JSON.stringify(storeData));

        }
        else {
            btn.text('save');
            table.find('.'+editClass).css('background-color','#cfc');
        }

        editInPlace(table, btn);
    }));

    ////map
    ymaps.ready(init);
    var myMap;

    function init() {

        myMap = new ymaps.Map('map', {
            center: [53.9, 27.56659], // Minsk
            zoom: 12
        });
        let names = $('.js-store-name');
        let addresses = $('.js-store-address');
        let numbers = $('.js-store-number');

        for (let i = 0; i < addresses.length; i++) {
            let address = addresses[i].innerText;
            let name = names[i].innerText;
            let number = numbers[i].innerText;

            //getting coordinates by address
            let myGeocoder = ymaps.geocode(address);
            myGeocoder.then(
                function (res) {
                    coords = res.geoObjects.get(0).geometry.getCoordinates();
                    let placeMark = new ymaps.Placemark(coords, {
                        balloonContent: name,
                        iconContent: number
                    });
                    myMap.geoObjects.add(placeMark);
                },
                function (err) {
                    alert('Error');
                }
            );
        }
    }
});