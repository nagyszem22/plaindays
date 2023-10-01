
# PlainDays

PlainDays is a simple and fully automated task scheduling app for busy individuals.  

As an engineer working at a startup I often face with the problem of ad-hoc tasks seriously altering the delivery dates of projects. I find it difficult to commit to deadlines or update my colleagues when they change without a clear picture of all my tasks.  

So the main goal of PlainDays is to help us keep track of all our tasks and provide us with a realistic timeline and schedule. I think of it as a smart personal assistant that helps me to remain on top of my things. 

Please note that this platform was created as part of a weekend project for the Appwrite Hackathon. This means that it is not yet stable. I am planning to work on it even after the Hackathon ends, so stay tuned for updates and stable releases. For now just enjoy scheduling your tasks and feel free to raise an issue if you find a bug or had an idea for an awesome new feature.

## The platform

The easiest way to try PlainDays is to visit its official website. Go to [plaindays.com](https://plaindays.com) hit sign up and give it a go. Of course if you have any questions feel free to contact me via takacsmarton22@gmail.com email or by opening an issue.

## Installation

### Frontend
Of course you can install the project on your local machine as well by pulling the repository and running the following commands.

```
cd frontend
npm install
npm run dev
```

Please note that it requires Node v18+.   

As default it connects to my private backend that runs in the Appwrite cloud infrastructure.  However, you can connect it to your own by changing the relevant variables in the config.js file in the root directory of the frontend.

### Functions
PlainDays currently have one function that is the heart of the whole product.  
It is responsible for rescheduling all your tasks when there are new ones added or a reschedule is requested. It was written in TypeScript and has many unit tests to test different scenarios. I am aware that not all use cases are tested yet, however this is part of the project plan.  

In case you want to run it in your own environment head to the config.js file in the root directory and change the relevant variables.   

Feel free to use the Type definitions to setup your own collection.


## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)