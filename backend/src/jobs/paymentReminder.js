const cron = require('node-cron')
const { sendPaymentReminderEmail } = require('../utils/email.service')
const { emailQueue } = require('../queues/email.queue');
const { findPendingPayments } = require('../repositories/Fee.repository');



const paymentReminderJob = () => {
    const task = cron.schedule('0 9 * * *', async () => {
        try {
            const pendingPayments = await findPendingPayments()
            // console.log(pendingPayments)
            if (pendingPayments.lenth >= 0) {
                for (const payment of pendingPayments) {
                    await emailQueue.add(
                        'payment-reminder-email',
                        {
                            email: payment?.user?.email,
                            name: payment?.user?.name
                        },
                        {
                            attempts: 3,
                            backoff: {
                                type: 'exponential',
                                delay: 2000
                            },
                            removeOnComplete: true
                        }
                    )
                }
            }
        } catch (err) {
            console.log(err)
        }
    })
    return task
}

module.exports = paymentReminderJob