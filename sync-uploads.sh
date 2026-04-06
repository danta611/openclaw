#!/bin/bash
# 同步uploads目录到部署目录
while true; do
  rsync -av --delete /root/.openclaw/workspace/quotation-system-3002/public/uploads/ /var/www/quotation-system-3002/uploads/
  sleep 5
done
