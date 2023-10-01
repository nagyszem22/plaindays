
# PlainDays

PlainDays is a simple and fully automated task scheduling app designed for busy individuals.  

As an engineer working at a startup, I often encounter the challenge of ad-hoc tasks significantly impacting project delivery dates. It becomes difficult for me to commit to deadlines or inform my colleagues about changes without a clear overview of all my tasks.

The main goal of PlainDays is to help users keep track of their tasks and provide a realistic timeline and schedule. It acts as a smart personal assistant, assisting in staying organized.  

Please note that this platform was created as part of a weekend project for the Appwrite Hackathon. As a result, it is not yet stable. I plan to continue working on it even after the Hackathon ends, so stay tuned for updates and stable releases. For now, enjoy scheduling your tasks and don't hesitate to report any bugs or share ideas for exciting new features.  

## The platform

The easiest way to try PlainDays is to visit its official website. Go to [plaindays.com](https://plaindays.com), hit sign up and give it a go. If you have any questions feel free to contact me via takacsmarton22@gmail.com email or by opening an issue.

## Installation

### Frontend
You can also install the project on your local machine as well by pulling the repository and running the following commands.

```
cd frontend
npm install
npm run dev
```

Please note that it requires Node v18+.   

As default it connects to my private backend that runs in the Appwrite cloud infrastructure. However, you can connect it to your own by changing the relevant variables in the config.js file in the root directory of the frontend folder.

### Functions
PlainDays currently have one function that is the heart of the app.  
It is responsible for rescheduling all your tasks when there are new ones added or a reschedule is requested. It was written in TypeScript and has many unit tests to test different scenarios. Not all the use cases are tested yet so feel free to contribute with helping me covering more edge cases. It is also important to highlight that there are quite a few limitations of the algorithm. E.g.: complexity can be reduced, tasks that can not be scheduled can be submitted causing a time out error, there is a 120 requests rate limit on Appwrite document writes that is not yet covered etc.  

In case you want to run it in your own environment head to the config.js file in the root directory and change the relevant variables.   

Feel free to use the Type definitions to setup your own collection.


## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)