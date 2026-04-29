<?php

namespace Database\Seeders;

use App\Models\Xuxemon;
use Illuminate\Database\Seeder;

class XuxemonSeeder extends Seeder
{
    public function run(): void
    {
        $catalogo = [
            [1, 'Aquarion', 'agua', 'Un xuxemon acuatico que controla las mareas.'],
            [2, 'Terrock', 'tierra', 'Xuxemon de roca con una defensa impenetrable.'],
            [3, 'Ventus', 'aire', 'Xuxemon volador veloz como el viento.'],
            [4, 'Ondina', 'agua', 'Xuxemon acuatico agil y jugueton.'],
            [5, 'Pedregal', 'tierra', 'Xuxemon terrestre solido como una montana.'],
            [6, 'Cielix', 'aire', 'Surca los cielos con un canto melodioso.'],
            [7, 'Mareton', 'agua', 'Gigante de las profundidades marinas.'],
            [8, 'Dunarex', 'tierra', 'Xuxemon del desierto con armadura de arena.'],
            [9, 'Plumyx', 'aire', 'Xuxemon con plumas que brillan al sol.'],
            [10, 'Torrentis', 'agua', 'Controla las corrientes de los rios.'],
            [11, 'Gravix', 'tierra', 'Xuxemon que manipula la gravedad a su alrededor.'],
            [12, 'Zefyra', 'aire', 'Crea tornados con un aleteo de sus alas.'],
            [13, 'Coralix', 'agua', 'Xuxemon marino protector de los arrecifes.'],
            [14, 'Montaraz', 'tierra', 'Habita en las cumbres mas altas.'],
            [15, 'Huracan', 'aire', 'El xuxemon mas rapido de los cielos.'],
            [16, 'Neptux', 'agua', 'Xuxemon guardian de las aguas profundas.'],
            [17, 'Arenix', 'tierra', 'Se camufla perfectamente en el desierto.'],
            [18, 'Brisax', 'aire', 'Genera brisas refrescantes a su paso.'],
            [19, 'Olearis', 'agua', 'Cabalga sobre olas gigantes con elegancia.'],
            [20, 'Creston', 'tierra', 'Su cresta de piedra corta el acero.'],
            [21, 'Ciclonix', 'aire', 'Envuelve a sus rivales en un ciclon imparable.'],
            [22, 'Glacius', 'agua', 'Congela todo a su alrededor con su aliento.'],
            [23, 'Magmax', 'tierra', 'Xuxemon volcanico que expulsa rocas fundidas.'],
            [24, 'Stratox', 'aire', 'Vuela tan alto que roza la estratosfera.'],
            [25, 'Riachux', 'agua', 'Pequeno pero con corrientes muy fuertes.'],
            [26, 'Sismix', 'tierra', 'Sus pisadas provocan temblores de tierra.'],
            [27, 'Alaris', 'aire', 'Sus alas despliegan un brillo dorado.'],
            [28, 'Abismal', 'agua', 'Vive en las fosas marinas mas oscuras.'],
            [29, 'Cantrex', 'tierra', 'Xuxemon formado por cristales de cuarzo.'],
            [30, 'Tifonis', 'aire', 'Desatara tifones con su cola en espiral.'],
            [31, 'Manglar', 'agua', 'Protector de los manglares costeros.'],
            [32, 'Fosilus', 'tierra', 'Xuxemon ancestral despertado de un fosil.'],
            [33, 'Boreasix', 'aire', 'Trae el viento del norte helado.'],
            [34, 'Cascadix', 'agua', 'Lanza chorros de agua a gran presion.'],
            [35, 'Talux', 'tierra', 'Xuxemon minero que excava tuneles sin parar.'],
            [36, 'Neblux', 'aire', 'Se oculta entre la niebla para atacar.'],
            [37, 'Vaporus', 'agua', 'Se transforma en vapor para esquivar ataques.'],
            [38, 'Geodus', 'tierra', 'Tiene gemas incrustadas en su espalda.'],
            [39, 'Aeronix', 'aire', 'Su vuelo es silencioso como la noche.'],
            [40, 'Deltix', 'agua', 'Habita en los deltas donde el rio encuentra el mar.'],
            [41, 'Petrax', 'tierra', 'Su piel es dura como el granito pulido.'],
            [42, 'Galernix', 'aire', 'Provoca galernas en las costas con su aleteo.'],
            [43, 'Espumax', 'agua', 'Cubre todo de espuma marina al luchar.'],
            [44, 'Obsidux', 'tierra', 'Forjado en obsidiana volcanica milenaria.'],
            [45, 'Cumulix', 'aire', 'Se posa sobre las nubes para descansar.'],
            [46, 'Tsunamix', 'agua', 'Desata tsunamis cuando se enfada.'],
        ];

        foreach ($catalogo as [$id, $nombre, $tipo, $descripcion]) {
            Xuxemon::updateOrCreate(
                ['id' => $id],
                [
                    'nombre' => $nombre,
                    'tipo' => $tipo,
                    'descripcion' => $descripcion,
                    'imagen' => "/imagenes/assets/{$id}.webp",
                    'tamano' => 'Pequeño',
                    'enfermedad' => null,
                ]
            );
        }
    }
}
