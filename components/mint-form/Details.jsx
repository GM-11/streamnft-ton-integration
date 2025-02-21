import { useFormContext } from 'react-hook-form';
import Input from '../Reusables/utility/Input';

const Details = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="bg-black-8 p-4 rounded-md flex flex-row w-full justify-between">
   

      {/* Twitter Link Field */}
      <div className="mb-6">
      <Input
          label="Twitter Link"
          reactHookFormRegister={{
            ...register("twitterLink"),
          }}
          placeholder="Twitter Link"
          
        />
        {errors.twitterLink && (
          <p className="text-red text-sm mt-1">{errors.twitterLink.message}</p>
        )}
      </div>

      {/* Discord Invite Link Field */}
      <div className="mb-6">
      <Input
          label="Discord Link"
          reactHookFormRegister={{
            ...register("discordLink"),
          }}
          placeholder="Discord Link"
          
        />
        {errors.discordLink && (
          <p className="text-red text-sm mt-1">{errors.discordLink.message}</p>
        )}
      </div>

      {/* Website Link Field */}
      <div className="mb-6">
      <Input
          label="Website Link"
          reactHookFormRegister={{
            ...register("websiteLink"),
          }}
          placeholder="Website Link"
          
        />
        {errors.websiteLink && (
          <p className="text-red text-sm mt-1">{errors.websiteLink.message}</p>
        )}
      </div>
    </div>
  );
};

export default Details;
