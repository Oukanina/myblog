import passport from '../core/passport';

export default function istoken(app) {
  app.get('/istoken',
    passport.authenticate('bearer', { session: false }),
    (req, res) => {
      res.json({ status: 'ok' });
    });
}
