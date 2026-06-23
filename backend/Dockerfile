FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production 

COPY ..

ENV CLOUDINARY_API_KEY=126232486978541
ENV CLOUDINARY_API_SECRET=aByXkqcXI9y4fAVs7OBzPqGSVsY
ENV CLOUDINARY_CLOUD_NAME=ovdrfpf7
ENV FRONTEND_URL=https://indore-corporation-area-athletics-as.netlify.app
ENV MONGODB_URI="mongodb+srv://arpittiwari6912_db_user:Xt0aH1LvjdFFxHIy@sportshubcluster.wu2im9y.mongodb.net/?appName=SportsHubCluster"
ENV NODE_TYPE=DEVELOPMENT   
ENV PORT=8000
ENV DB_HOST=localhost
ENV DB_NAME=sportshub
ENV DB_USER=postgres
ENV DB_PASSWORD=root
ENV DB_DIALECT=postgres
ENV DB_PORT=5432
ENV SALT_ROUND=10
ENV JWT_SECRET_KEY=supersecretjwtkey12345
ENV JWT_EXPIRE_IN=7d
ENV EMAIL_USER=arpitcloud11@gmail.com
ENV EMAIL_PASS=qopmrateglnjyalt

EXPOSE 8000

CMD ["node", "scr/app.js"]