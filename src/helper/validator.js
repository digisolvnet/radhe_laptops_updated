export const validator = (schema) => {
    return async (req, res, next) => {
      try {
        const data = req.body;
  
        await schema.validateSync(data, { abortEarly: false });
        next();
      } catch (error) {
        if (error.inner) {
          const errors = error.inner.map((item) => ({
            path: item.path,
            message: item.message,
          }));
          return res.status(400).json([errors]);
        } else {
          console.log('unexpected error', error);
        }
      }
    };
  };
  