import passport from '../core/passport';

export default function me(app) {
  app.get('/me',
    passport.authenticate('bearer', { session: false }),
    (req, res) => {
      res.json(req.user);
    });
}
