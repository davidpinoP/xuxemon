<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            background: #f4f4f4;
        }

        .container {
            max-width: 500px;
            margin: 50px auto;
            background: white;
            padding: 30px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        h1 {
            text-align: center;
            margin-bottom: 20px;
        }

        .info {
            margin-bottom: 10px;
        }

        .info strong {
            display: inline-block;
            width: 120px;
        }

        button {
            width: 100%;
            padding: 10px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            margin-top: 20px;
        }

        button:hover {
            background: #c82333;
        }
    </style>
</head>

<body>
    <div class="container">
        <h1>Dashboard</h1>
        <div class="info"><strong>Nombre:</strong> {{ Auth::user()->name }} {{ Auth::user()->surname }}</div>
        <div class="info"><strong>Email:</strong> {{ Auth::user()->email }}</div>
        <div class="info"><strong>Player ID:</strong> {{ Auth::user()->player_id }}</div>
        <div class="info"><strong>Rol:</strong> {{ Auth::user()->role }}</div>
        <div class="info"><strong>Activo:</strong> {{ Auth::user()->is_active ? 'Sí' : 'No' }}</div>

        <form method="POST" action="{{ route('logout') }}">
            @csrf
            <button type="submit">Cerrar Sesión</button>
        </form>
    </div>
</body>

</html>