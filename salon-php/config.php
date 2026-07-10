<?php

declare(strict_types=1);

return [
    'printer_command_url' => getenv('PRINTER_COMMAND_URL') ?: 'http://192.168.1.10/comandas/backend-php/public/api/printing/command',
    'data_dir' => __DIR__ . DIRECTORY_SEPARATOR . 'data',
];
