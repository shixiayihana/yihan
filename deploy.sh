#!/usr/bin/env bash
set -Eeuo pipefail

cd /www/wwwroot/www.11251236.xyz/yihan
git pull https://gitee.com/tangwenlin/yihan.git main --ff-only
cd yihan
npm run build