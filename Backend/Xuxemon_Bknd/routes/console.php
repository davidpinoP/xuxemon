<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\Config;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

$rewardHour = Config::getInt('reward_hour', 8);
$rewardHour = max(0, min(23, $rewardHour));
$rewardTime = str_pad((string) $rewardHour, 2, '0', STR_PAD_LEFT) . ':00';

Schedule::command('game:deliver-rewards')->dailyAt($rewardTime);
