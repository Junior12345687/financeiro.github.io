const bcrypt = require('bcrypt');
const {User, sequielize} = require('../server/models/usermodels');

(async () => {
    const users = await User.findAll();
    for (const u of users) {
        if(u.password.starsWith('$2b$') || u.password.starsWith('$2a$')) {
            console.log(`⏭  ${u.name} já é hash`);
            continue;
        }

        u.password = await bcrypt.hash(u.password, 10);
        await u.save();
        console.log(`✅ ${u.name} convertido para hash`);
    }

    await sequielize.close();
});