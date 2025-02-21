import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";

import { Address, beginCell, Builder, toNano } from "ton";
const LEND_TOKEN_OPCODE = 949256189;

export function useConnection() {
  try {
    const [tonConnectUI] = useTonConnectUI();
    const rawAddress = useTonAddress(true);

    return {
      sender: {
        send: async (args) => {
          const opCode = args.body.beginParse().loadUint(32);

          let messages = [
            {
              address: args.to.toString(),
              amount: args.value.toString(),
              payload: args.body?.toBoc().toString("base64"),
            },
          ];

          if (opCode === LEND_TOKEN_OPCODE) {
            const body = args.body.beginParse();
            body.skip(32);
            const tokenAddress = body.loadAddress();

            console.log(args.to.toString());

            const src = {
              $$type: "Transfer",
              query_id: 0n,
              new_owner: Address.parse(args.to.toString()),
              custom_payload: null,
              forward_amount: toNano("0.1"),
              forward_payload: beginCell().endCell().asSlice(),
              response_destination: Address.parse(rawAddress),
            };

            let b_0 = new Builder();
            b_0.storeUint(1607220500, 32);
            b_0.storeUint(src.query_id, 64);
            b_0.storeAddress(src.new_owner);
            b_0.storeAddress(src.response_destination);
            if (
              src.custom_payload !== null &&
              src.custom_payload !== undefined
            ) {
              b_0.storeBit(true).storeRef(src.custom_payload);
            } else {
              b_0.storeBit(false);
            }
            b_0.storeCoins(src.forward_amount);
            b_0.storeBuilder(src.forward_payload.asBuilder());
            messages.push({
              address: tokenAddress.toString(), // token address
              amount: toNano("0.2").toString(),
              payload: b_0.asCell().toBoc().toString("base64"),
            });

            console.log(messages);
          }

          const result = await tonConnectUI.sendTransaction({
            messages,
            validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes
          });
          console.log(result);
        },
        address: rawAddress,
      },
    };
  } catch (e) {
    console.error("Error in useConnection:", e);
    return {
      sender: {
        send: async () => {},
        address: null,
      },
    };
  }
}
