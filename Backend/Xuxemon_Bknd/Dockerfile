FROM php:8.2-apache

RUN docker-php-ext-install pdo_mysql
RUN a2enmod rewrite

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .

RUN composer install --no-dev --no-interaction

RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 80
