import schedule
import time

def update_likes():
    # TODO
    pass

schedule.every(10).minutes.do(update_likes)

while True:
    schedule.run_pending()
    time.sleep(1)